package com.pokepack.card;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Een enkele kaart binnen een set. Wordt gevuld door sync-job vanuit de externe API — nooit
 * handmatig gemuteerd door de backend zelf.
 */
@Entity
@Table(name = "cards")
public class Card {

    @Id
    @Column(length = 60)
    private String id; // API card id, bv. "base1-4"

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "set_id", nullable = false)
    private CardSet set;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 20)
    private String number;

    @Column(nullable = false, length = 60)
    private String rarity;

    @Column(name = "primary_type", length = 30)
    private String primaryType;

    @Column(name = "image_small_url", columnDefinition = "text")
    private String imageSmallUrl;

    @Column(name = "image_large_url", columnDefinition = "text")
    private String imageLargeUrl;

    @Column(name = "synced_at", nullable = false)
    private Instant syncedAt = Instant.now();

    protected Card() {
        // JPA
    }

    public Card(String id, CardSet set, String name, String number, String rarity) {
        this.id = id;
        this.set = set;
        this.name = name;
        this.number = number;
        this.rarity = rarity;
    }

    public String getId() {
        return id;
    }

    public CardSet getSet() {
        return set;
    }

    public String getName() {
        return name;
    }

    public String getNumber() {
        return number;
    }

    public String getRarity() {
        return rarity;
    }

    public String getPrimaryType() {
        return primaryType;
    }

    public void setPrimaryType(String primaryType) {
        this.primaryType = primaryType;
    }

    public String getImageSmallUrl() {
        return imageSmallUrl;
    }

    public void setImageSmallUrl(String imageSmallUrl) {
        this.imageSmallUrl = imageSmallUrl;
    }

    public String getImageLargeUrl() {
        return imageLargeUrl;
    }

    public void setImageLargeUrl(String imageLargeUrl) {
        this.imageLargeUrl = imageLargeUrl;
    }

    /** Common/Uncommon zijn de enige rarities zonder holo-effect — zie lib/rarity.ts in frontend. */
    public boolean isCommonOrUncommon() {
        return "Common".equalsIgnoreCase(rarity) || "Uncommon".equalsIgnoreCase(rarity);
    }
}
