package com.pokepack.pack;

import com.pokepack.card.CardSet;
import jakarta.persistence.*;
import java.time.Instant;

/**
 * Een koopbaar pack (bv. "Base Set boosterpack"). slot_* velden bepalen hoeveel kaarten van
 * elke tier erin zitten — zie docs/PROJECT_BRIEF.md §2.1.1. Nieuwe packs toevoegen = nieuwe
 * rij, geen nieuwe code.
 */
@Entity
@Table(name = "pack_types")
public class PackType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "set_id", nullable = false)
    private CardSet set;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private int price;

    @Column(name = "unlock_level", nullable = false)
    private int unlockLevel = 1;

    @Column(name = "slot_commons", nullable = false)
    private int slotCommons;

    @Column(name = "slot_uncommons", nullable = false)
    private int slotUncommons;

    @Column(name = "slot_reverse_holo", nullable = false)
    private int slotReverseHolo;

    @Column(name = "slot_hits", nullable = false)
    private int slotHits;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected PackType() {
        // JPA
    }

    public PackType(CardSet set, String name, int price, int unlockLevel,
                     int slotCommons, int slotUncommons, int slotReverseHolo, int slotHits) {
        this.set = set;
        this.name = name;
        this.price = price;
        this.unlockLevel = unlockLevel;
        this.slotCommons = slotCommons;
        this.slotUncommons = slotUncommons;
        this.slotReverseHolo = slotReverseHolo;
        this.slotHits = slotHits;
    }

    public Long getId() {
        return id;
    }

    public CardSet getSet() {
        return set;
    }

    public String getName() {
        return name;
    }

    public int getPrice() {
        return price;
    }

    public int getUnlockLevel() {
        return unlockLevel;
    }

    public int getSlotCommons() {
        return slotCommons;
    }

    public int getSlotUncommons() {
        return slotUncommons;
    }

    public int getSlotReverseHolo() {
        return slotReverseHolo;
    }

    public int getSlotHits() {
        return slotHits;
    }

    public boolean isActive() {
        return active;
    }
}
