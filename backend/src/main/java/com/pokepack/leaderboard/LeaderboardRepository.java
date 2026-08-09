package com.pokepack.leaderboard;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Ad-hoc aggregatie-queries, geen entity-backed CRUD — daarom JdbcTemplate i.p.v. Spring Data
 * JPA hier. Lichte MVP-versie van leaderboards (zie docs/PROJECT_BRIEF.md §2.4): berekend via
 * query, geen aparte tabel of Redis sorted sets (die komen erbij zodra het qua load nodig is).
 */
@Repository
public class LeaderboardRepository {

    private final JdbcTemplate jdbc;

    public LeaderboardRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<LeaderboardEntry> topByCoins(int limit) {
        return jdbc.query(
                "select id, name, coins as score from users order by coins desc, id limit ?",
                (rs, i) -> new LeaderboardEntry(rs.getLong("id"), rs.getString("name"), rs.getLong("score")),
                limit
        );
    }

    public List<LeaderboardEntry> topByCollectionSize(int limit) {
        return jdbc.query(
                """
                select u.id, u.name, coalesce(sum(uc.quantity), 0) as score
                from users u
                left join user_cards uc on uc.user_id = u.id
                group by u.id, u.name
                order by score desc, u.id
                limit ?
                """,
                (rs, i) -> new LeaderboardEntry(rs.getLong("id"), rs.getString("name"), rs.getLong("score")),
                limit
        );
    }

    public List<LeaderboardEntry> topByCompleteSets(int limit) {
        return jdbc.query(
                """
                select u.id, u.name, count(*) as score
                from users u
                join (
                    select uc.user_id, c.set_id
                    from user_cards uc
                    join cards c on c.id = uc.card_id
                    group by uc.user_id, c.set_id
                    having count(distinct uc.card_id) = (
                        select count(*) from cards c2 where c2.set_id = c.set_id
                    )
                ) complete_sets on complete_sets.user_id = u.id
                group by u.id, u.name
                order by score desc, u.id
                limit ?
                """,
                (rs, i) -> new LeaderboardEntry(rs.getLong("id"), rs.getString("name"), rs.getLong("score")),
                limit
        );
    }
}
