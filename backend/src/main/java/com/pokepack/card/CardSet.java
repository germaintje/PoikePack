package com.pokepack.card;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Een Pokémon TCG "set" (bv. Base Set, 151). Wordt gevuld door sync-job vanuit de externe
 * API — nooit handmatig gemuteerd door de backend zelf.
 */
@Entity
@Table(name = "card_sets")
public class CardSet {

    @Id
    @Column(length = 40)
    private String id; // API set id, bv. "base1"

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "logo_url", columnDefinition = "text")
    private String logoUrl;

    @Column(name = "symbol_url", columnDefinition = "text")
    private String symbolUrl;

    @Column(name = "synced_at", nullable = false)
    private Instant syncedAt = Instant.now();

    protected CardSet() {
        // JPA
    }

    public CardSet(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getSymbolUrl() {
        return symbolUrl;
    }

    public void setSymbolUrl(String symbolUrl) {
        this.symbolUrl = symbolUrl;
    }
}
