package com.pokepack.binder;

import com.pokepack.card.Card;
import com.pokepack.user.User;
import jakarta.persistence.*;
import java.time.Instant;

/** Eén rij per (user, card) — dit is de binder/inventory. quantity 0 komt niet voor: de rij
 * wordt verwijderd zodra de laatste exemplaren verkocht zijn (zie EconomyService). */
@Entity
@Table(name = "user_cards")
public class UserCard {

    @EmbeddedId
    private UserCardId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cardId")
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "obtained_at", nullable = false)
    private Instant obtainedAt = Instant.now();

    protected UserCard() {
        // JPA
    }

    public UserCard(User user, Card card, int quantity) {
        this.id = new UserCardId(user.getId(), card.getId());
        this.user = user;
        this.card = card;
        this.quantity = quantity;
    }

    public User getUser() {
        return user;
    }

    public Card getCard() {
        return card;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void incrementQuantity(int delta) {
        this.quantity += delta;
    }
}
