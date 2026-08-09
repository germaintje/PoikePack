package com.pokepack.quest;

import jakarta.persistence.*;

@Entity
@Table(name = "quests")
public class Quest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 255)
    private String description;

    /** daily, weekly, monthly, once — bepaalt hoe de period_key voor voortgang berekend wordt. */
    @Column(nullable = false, length = 20)
    private String period;

    @Column(name = "target_count", nullable = false)
    private int targetCount;

    @Column(name = "reward_coins", nullable = false)
    private int rewardCoins;

    @Column(name = "reward_xp", nullable = false)
    private int rewardXp;

    @Column(nullable = false)
    private boolean active = true;

    protected Quest() {
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

    public String getPeriod() {
        return period;
    }

    public int getTargetCount() {
        return targetCount;
    }

    public int getRewardCoins() {
        return rewardCoins;
    }

    public int getRewardXp() {
        return rewardXp;
    }

    public boolean isActive() {
        return active;
    }
}
