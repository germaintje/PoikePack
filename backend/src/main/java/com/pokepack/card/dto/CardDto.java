package com.pokepack.card.dto;

import com.pokepack.card.Card;

public record CardDto(
        String cardId,
        String name,
        String setId,
        String setName,
        String number,
        String rarity,
        String imageLargeUrl
) {
    public static CardDto from(Card c) {
        return new CardDto(
                c.getId(), c.getName(), c.getSet().getId(), c.getSet().getName(),
                c.getNumber(), c.getRarity(), c.getImageLargeUrl()
        );
    }
}
