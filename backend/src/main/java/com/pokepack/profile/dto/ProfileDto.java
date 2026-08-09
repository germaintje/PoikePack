package com.pokepack.profile.dto;

import com.pokepack.user.User;
import com.pokepack.user.UserStats;

import java.time.Instant;

public record ProfileDto(
        Long id,
        String name,
        String email,
        long coins,
        int level,
        String avatarEmoji,
        String bio,
        Instant createdAt,
        Instant lastLoginAt,
        UserStatsDto stats
) {
    public static ProfileDto from(User user, UserStats stats) {
        return new ProfileDto(
                user.getId(), user.getName(), user.getEmail(), user.getCoins(), user.getLevel(),
                user.getAvatarEmoji(), user.getBio(), user.getCreatedAt(), user.getLastLoginAt(),
                UserStatsDto.from(stats)
        );
    }
}
