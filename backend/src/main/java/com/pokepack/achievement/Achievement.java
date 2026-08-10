package com.pokepack.achievement;

import jakarta.persistence.*;

@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 255)
    private String description;

    /** packs_opened, cards_collected, coins_earned, coins_spent, complete_sets, level_reached,
     * daily_streak, first_holo, set_complete, set_holo_pulled — zie AchievementService. */
    @Column(nullable = false, length = 30)
    private String metric;

    /** Alleen gezet voor set_complete/set_holo_pulled — welke specifieke set deze achievement
     * betreft. Null voor alle andere (globale) metrics. */
    @Column(name = "set_id", length = 40)
    private String setId;

    @Column(nullable = false)
    private int threshold = 1;

    @Column(name = "reward_coins", nullable = false)
    private int rewardCoins;

    @Column(name = "reward_xp", nullable = false)
    private int rewardXp;

    protected Achievement() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getMetric() {
        return metric;
    }

    public String getSetId() {
        return setId;
    }

    public int getThreshold() {
        return threshold;
    }

    public int getRewardCoins() {
        return rewardCoins;
    }

    public int getRewardXp() {
        return rewardXp;
    }
}
