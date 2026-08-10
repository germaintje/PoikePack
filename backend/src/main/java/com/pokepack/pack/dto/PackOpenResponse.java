package com.pokepack.pack.dto;

import java.util.List;

public record PackOpenResponse(
        long packOpeningId,
        long coinsSpent,
        long coinsBalance,
        List<PulledCardDto> cards,
        Integer setCompletionBonusCoins, // null als er geen set voltooid is met deze pack
        List<String> unlockedAchievementNames,
        List<String> completedQuestNames,
        int playerLevel,
        long xp,
        long xpGained, // totale XP verdiend door déze ene actie (pack + nieuwe kaarten + quests + achievements)
        long xpForNextLevel
) {
}
