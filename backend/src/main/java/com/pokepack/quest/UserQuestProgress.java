package com.pokepack.quest;

import com.pokepack.user.User;
import jakarta.persistence.*;
import java.time.Instant;

/**
 * period_key laat voortgang vanzelf resetten per periode (bv. "2026-08-09" voor een daily
 * quest, "2026-W32" voor weekly, "once" voor eenmalige quests) zonder dat er een cron-job
 * nodig is die oude voortgang opruimt — zie ook database/migrations/V1__init.sql.
 */
@Entity
@Table(name = "user_quest_progress")
public class UserQuestProgress {

    @EmbeddedId
    private UserQuestProgressId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("questId")
    @JoinColumn(name = "quest_id", nullable = false)
    private Quest quest;

    @Column(nullable = false)
    private int progress = 0;

    @Column(name = "completed_at")
    private Instant completedAt;

    protected UserQuestProgress() {
        // JPA
    }

    public UserQuestProgress(User user, Quest quest, String periodKey) {
        this.id = new UserQuestProgressId(user.getId(), quest.getId(), periodKey);
        this.user = user;
        this.quest = quest;
    }

    public UserQuestProgressId getId() {
        return id;
    }

    public int getProgress() {
        return progress;
    }

    public void incrementProgress() {
        this.progress += 1;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void markCompleted() {
        this.completedAt = Instant.now();
    }

    public boolean isCompleted() {
        return completedAt != null;
    }
}
