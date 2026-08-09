package com.pokepack.user.dto;

import com.pokepack.user.LevelCurve;
import com.pokepack.user.User;

public record UserDto(
        Long id,
        String name,
        String email,
        long coins,
        int level,
        long xp,
        long xpForCurrentLevel,
        long xpForNextLevel,
        String avatarEmoji,
        String bio
) {
    public static UserDto from(User u) {
        int level = u.getLevel();
        return new UserDto(
                u.getId(), u.getName(), u.getEmail(), u.getCoins(), level, u.getXp(),
                LevelCurve.xpRequiredForLevel(level), LevelCurve.xpRequiredForLevel(level + 1),
                u.getAvatarEmoji(), u.getBio()
        );
    }
}
