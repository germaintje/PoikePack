package com.pokepack.binder.dto;

public record BinderEntryDto(
        String cardId,
        String name,
        String setId,
        String setName,
        String number,
        String rarity,
        String imageLargeUrl,
        int quantity
) {
}
