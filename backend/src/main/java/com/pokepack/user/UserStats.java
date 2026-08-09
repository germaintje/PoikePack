package com.pokepack.user;

import jakarta.persistence.*;
import org.springframework.data.domain.Persistable;

import java.time.Instant;

/**
 * Losse tabel i.p.v. kolommen op `users` — dit zijn afgeleide/optelbare cijfers, geen
 * identiteitsgegevens, en dit is waar toekomstige per-speler statistieken bij horen zonder de
 * kern-tabel te belasten. Bedoeld om te groeien (meer tellers) zonder de rest te raken.
 *
 * Implementeert Persistable: de @Id hier is handmatig toegewezen (= user_id, geen
 * @GeneratedValue), en zonder dit zou Spring Data JPA elke save() als een merge() van een
 * "bestaande" rij behandelen — dat botst met de @MapsId-relatie op een net aangemaakte rij
 * (Hibernate AssertionFailure: null identifier). isNew() vertelt Spring Data expliciet wanneer
 * het een insert (persist) i.p.v. update (merge) moet doen.
 */
@Entity
@Table(name = "user_stats")
public class UserStats implements Persistable<Long> {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "packs_opened_total", nullable = false)
    private int packsOpenedTotal = 0;

    @Column(name = "coins_earned_total", nullable = false)
    private long coinsEarnedTotal = 0;

    @Column(name = "coins_spent_total", nullable = false)
    private long coinsSpentTotal = 0;

    @Column(name = "cards_collected_total", nullable = false)
    private int cardsCollectedTotal = 0;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Transient
    private boolean isNew = false;

    protected UserStats() {
        // JPA
    }

    public UserStats(User user) {
        this.userId = user.getId();
        this.user = user;
        this.isNew = true;
    }

    @Override
    public Long getId() {
        return userId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostPersist
    @PostLoad
    void markNotNew() {
        this.isNew = false;
    }

    public Long getUserId() {
        return userId;
    }

    public int getPacksOpenedTotal() {
        return packsOpenedTotal;
    }

    public long getCoinsEarnedTotal() {
        return coinsEarnedTotal;
    }

    public long getCoinsSpentTotal() {
        return coinsSpentTotal;
    }

    public int getCardsCollectedTotal() {
        return cardsCollectedTotal;
    }

    void addPackOpened() {
        packsOpenedTotal += 1;
        touch();
    }

    void addCoinsEarned(long amount) {
        coinsEarnedTotal += amount;
        touch();
    }

    void addCoinsSpent(long amount) {
        coinsSpentTotal += amount;
        touch();
    }

    void addCardCollected() {
        cardsCollectedTotal += 1;
        touch();
    }

    private void touch() {
        updatedAt = Instant.now();
    }
}
