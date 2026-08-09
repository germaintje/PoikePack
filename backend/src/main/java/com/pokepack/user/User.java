package com.pokepack.user;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /** Nullable op DB-niveau (zie V4-migratie); AuthService garandeert 'm bij registratie. */
    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "avatar_emoji", nullable = false, length = 8)
    private String avatarEmoji = "🧑";

    @Column(length = 280)
    private String bio;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(nullable = false)
    private long coins;

    @Column(nullable = false)
    private int level = 1;

    @Column(nullable = false)
    private long xp = 0;

    @Column(name = "daily_streak", nullable = false)
    private int dailyStreak = 0;

    @Column(name = "last_daily_bonus_date")
    private LocalDate lastDailyBonusDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected User() {
        // JPA
    }

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getAvatarEmoji() {
        return avatarEmoji;
    }

    public void setAvatarEmoji(String avatarEmoji) {
        this.avatarEmoji = avatarEmoji;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public long getCoins() {
        return coins;
    }

    public void setCoins(long coins) {
        if (coins < 0) {
            throw new IllegalArgumentException("coins kunnen niet negatief worden");
        }
        this.coins = coins;
    }

    public int getLevel() {
        return level;
    }

    public long getXp() {
        return xp;
    }

    /** Enige manier om XP toe te kennen — herberekent het level meteen mee via LevelCurve, zodat
     * xp en level nooit uit sync kunnen raken. */
    public void addXp(long amount) {
        if (amount <= 0) return;
        this.xp += amount;
        this.level = LevelCurve.levelForXp(this.xp);
    }

    public int getDailyStreak() {
        return dailyStreak;
    }

    public void setDailyStreak(int dailyStreak) {
        this.dailyStreak = dailyStreak;
    }

    public LocalDate getLastDailyBonusDate() {
        return lastDailyBonusDate;
    }

    public void setLastDailyBonusDate(LocalDate lastDailyBonusDate) {
        this.lastDailyBonusDate = lastDailyBonusDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
