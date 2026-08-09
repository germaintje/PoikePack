package com.pokepack.achievement;

import com.pokepack.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_achievements")
public class UserAchievement {

    @EmbeddedId
    private UserAchievementId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("achievementId")
    @JoinColumn(name = "achievement_id", nullable = false)
    private Achievement achievement;

    @Column(name = "unlocked_at", nullable = false)
    private Instant unlockedAt = Instant.now();

    protected UserAchievement() {
        // JPA
    }

    public UserAchievement(User user, Achievement achievement) {
        this.id = new UserAchievementId(user.getId(), achievement.getId());
        this.user = user;
        this.achievement = achievement;
    }

    public Achievement getAchievement() {
        return achievement;
    }

    public Instant getUnlockedAt() {
        return unlockedAt;
    }
}
