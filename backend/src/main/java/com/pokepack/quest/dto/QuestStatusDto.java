package com.pokepack.quest.dto;

public record QuestStatusDto(
        String code,
        String name,
        String description,
        String period,
        int targetCount,
        int rewardCoins,
        int progress,
        boolean completed
) {
}
