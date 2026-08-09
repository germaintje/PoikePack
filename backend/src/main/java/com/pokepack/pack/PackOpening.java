package com.pokepack.pack;

import com.pokepack.user.User;
import jakarta.persistence.*;
import java.time.Instant;

/** Audit-log van een geopende pack, voor support/anti-cheat. Wordt nooit gewijzigd na aanmaak. */
@Entity
@Table(name = "pack_openings")
public class PackOpening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pack_type_id", nullable = false)
    private PackType packType;

    @Column(name = "pulled_card_ids", nullable = false, columnDefinition = "text")
    private String pulledCardIds;

    @Column(name = "coins_spent", nullable = false)
    private int coinsSpent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected PackOpening() {
        // JPA
    }

    public PackOpening(User user, PackType packType, String pulledCardIds, int coinsSpent) {
        this.user = user;
        this.packType = packType;
        this.pulledCardIds = pulledCardIds;
        this.coinsSpent = coinsSpent;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public PackType getPackType() {
        return packType;
    }

    public String getPulledCardIds() {
        return pulledCardIds;
    }

    public int getCoinsSpent() {
        return coinsSpent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
