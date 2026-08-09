package com.pokepack.achievement.dto;

import java.time.Instant;

public record AchievementStatusDto(
        String code,
        String name,
        String description,
        int rewardCoins,
        boolean unlocked,
        Instant unlockedAt
) {
}
