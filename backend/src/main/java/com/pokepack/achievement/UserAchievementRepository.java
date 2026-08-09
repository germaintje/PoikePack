package com.pokepack.achievement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, UserAchievementId> {

    boolean existsByUser_IdAndAchievement_Id(Long userId, Long achievementId);

    @Query("select ua from UserAchievement ua join fetch ua.achievement where ua.user.id = :userId")
    List<UserAchievement> findAllByUserId(@Param("userId") Long userId);
}
