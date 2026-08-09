package com.pokepack.quest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserQuestProgressRepository extends JpaRepository<UserQuestProgress, UserQuestProgressId> {

    @Query("select p from UserQuestProgress p where p.user.id = :userId and p.quest.id = :questId and p.id.periodKey = :periodKey")
    Optional<UserQuestProgress> findCurrent(@Param("userId") Long userId, @Param("questId") Long questId, @Param("periodKey") String periodKey);

    @Query("select p from UserQuestProgress p join fetch p.quest where p.user.id = :userId and p.id.periodKey = :periodKey")
    List<UserQuestProgress> findAllForUserInPeriod(@Param("userId") Long userId, @Param("periodKey") String periodKey);
}
