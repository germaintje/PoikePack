package com.pokepack.pack.dto;

public record PulledCardDto(
        String cardId,
        String name,
        String setName,
        String number,
        String rarity,
        String imageLargeUrl,
        boolean reverseHolo,
        boolean duplicate,
        int sellValue
) {
}
