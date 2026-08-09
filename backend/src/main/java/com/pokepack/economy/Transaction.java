package com.pokepack.economy;

import com.pokepack.user.User;
import jakarta.persistence.*;
import java.time.Instant;

/** Log van elke coin-mutatie. Negatief amount = uitgave, positief = inkomsten. */
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionType type;

    @Column(nullable = false)
    private long amount;

    @Column(length = 255)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Transaction() {
        // JPA
    }

    public Transaction(User user, TransactionType type, long amount, String note) {
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.note = note;
    }

    public Long getId() {
        return id;
    }

    public TransactionType getType() {
        return type;
    }

    public long getAmount() {
        return amount;
    }

    public String getNote() {
        return note;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
