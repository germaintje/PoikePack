package com.pokepack.leaderboard;

import com.pokepack.binder.UserCard;
import com.pokepack.binder.UserCardRepository;
import com.pokepack.card.Card;
import com.pokepack.card.CardRepository;
import com.pokepack.card.CardSet;
import com.pokepack.card.CardSetRepository;
import com.pokepack.user.User;
import com.pokepack.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@DirtiesContext
class LeaderboardRepositoryIntegrationTest {

    @Autowired
    private LeaderboardRepository leaderboardRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CardSetRepository cardSetRepository;
    @Autowired
    private CardRepository cardRepository;
    @Autowired
    private UserCardRepository userCardRepository;

    private User rich;
    private User poor;

    // LeaderboardRepository leest via JdbcTemplate (rechtstreeks JDBC, buiten Hibernate om), dus
    // pending JPA-writes binnen dezelfde testtransactie zijn niet automatisch zichtbaar zoals
    // bij een JPA-query (die altijd eerst auto-flushed) — vandaar saveAndFlush hier. In het echte
    // request/response-verkeer speelt dit niet: elke HTTP-call is al een eigen, gecommitte
    // transactie tegen de tijd dat een leaderboard-request draait.
    @BeforeEach
    void seed() {
        rich = userRepository.save(new User("Rich", "rich@example.com"));
        rich.setCoins(1000);
        userRepository.saveAndFlush(rich);

        poor = userRepository.save(new User("Poor", "poor@example.com"));
        poor.setCoins(10);
        userRepository.saveAndFlush(poor);
    }

    @Test
    void topByCoinsOrdersDescending() {
        List<LeaderboardEntry> top = leaderboardRepository.topByCoins(10);

        assertThat(top).extracting(LeaderboardEntry::userId).contains(rich.getId(), poor.getId());
        int richIndex = indexOf(top, rich.getId());
        int poorIndex = indexOf(top, poor.getId());
        assertThat(richIndex).isLessThan(poorIndex);
        assertThat(top.get(richIndex).score()).isEqualTo(1000);
    }

    @Test
    void topByCollectionSizeCountsTotalQuantity() {
        CardSet set = cardSetRepository.save(new CardSet("lb-set", "LB Set"));
        Card cardA = cardRepository.save(new Card("lb-a", set, "A", "1", "Common"));
        Card cardB = cardRepository.save(new Card("lb-b", set, "B", "2", "Common"));
        userCardRepository.save(new UserCard(rich, cardA, 3));
        userCardRepository.save(new UserCard(rich, cardB, 2));
        userCardRepository.saveAndFlush(new UserCard(poor, cardA, 1));

        List<LeaderboardEntry> top = leaderboardRepository.topByCollectionSize(10);

        assertThat(top.get(indexOf(top, rich.getId())).score()).isEqualTo(5);
        assertThat(top.get(indexOf(top, poor.getId())).score()).isEqualTo(1);
    }

    @Test
    void topByCompleteSetsOnlyCountsFullyOwnedSets() {
        CardSet set = cardSetRepository.save(new CardSet("complete-set", "Complete Set"));
        Card only = cardRepository.save(new Card("complete-only", set, "Only", "1", "Common"));
        userCardRepository.saveAndFlush(new UserCard(rich, only, 1)); // rich heeft de hele set (1 kaart)
        // poor heeft niks van deze set

        List<LeaderboardEntry> top = leaderboardRepository.topByCompleteSets(10);

        assertThat(top).extracting(LeaderboardEntry::userId).contains(rich.getId());
        assertThat(top).extracting(LeaderboardEntry::userId).doesNotContain(poor.getId());
    }

    private int indexOf(List<LeaderboardEntry> entries, Long userId) {
        for (int i = 0; i < entries.size(); i++) {
            if (entries.get(i).userId().equals(userId)) return i;
        }
        throw new AssertionError("userId " + userId + " niet gevonden in leaderboard");
    }
}
