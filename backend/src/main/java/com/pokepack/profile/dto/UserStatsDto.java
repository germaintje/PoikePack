package com.pokepack.profile.dto;

import com.pokepack.user.UserStats;

public record UserStatsDto(
        int packsOpenedTotal,
        long coinsEarnedTotal,
        long coinsSpentTotal,
        int cardsCollectedTotal
) {
    public static UserStatsDto from(UserStats s) {
        return new UserStatsDto(s.getPacksOpenedTotal(), s.getCoinsEarnedTotal(), s.getCoinsSpentTotal(), s.getCardsCollectedTotal());
    }
}
