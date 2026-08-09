package com.pokepack.card;

import com.pokepack.card.dto.CardDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardRepository cardRepository;

    public CardController(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    // Gebruikt door de binder-UI om ook niet-bezeten kaarten van een set te tonen
    // (setvoortgang, "?"-placeholders) — zie GET /api/binder voor wat de speler wél heeft.
    @GetMapping
    public List<CardDto> listBySet(@RequestParam String setId) {
        return cardRepository.findBySetIdWithSet(setId).stream().map(CardDto::from).toList();
    }
}
