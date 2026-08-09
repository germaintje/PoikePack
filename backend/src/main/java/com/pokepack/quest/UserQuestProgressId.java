package com.pokepack.quest;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserQuestProgressId implements Serializable {

    private Long userId;
    private Long questId;
    private String periodKey;

    protected UserQuestProgressId() {
        // JPA
    }

    public UserQuestProgressId(Long userId, Long questId, String periodKey) {
        this.userId = userId;
        this.questId = questId;
        this.periodKey = periodKey;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getQuestId() {
        return questId;
    }

    public String getPeriodKey() {
        return periodKey;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserQuestProgressId that)) return false;
        return Objects.equals(userId, that.userId)
                && Objects.equals(questId, that.questId)
                && Objects.equals(periodKey, that.periodKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, questId, periodKey);
    }
}
