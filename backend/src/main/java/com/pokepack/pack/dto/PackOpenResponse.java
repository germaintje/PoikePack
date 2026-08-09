package com.pokepack.pack.dto;

import java.util.List;

public record PackOpenResponse(
        long packOpeningId,
        long coinsSpent,
        long coinsBalance,
        List<PulledCardDto> cards,
        Integer setCompletionBonusCoins, // null als er geen set voltooid is met deze pack
        List<String> unlockedAchievementNames,
        int playerLevel,
        long xp,
        long xpForNextLevel
) {
}
