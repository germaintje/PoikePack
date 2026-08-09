package com.pokepack.user.dto;

import com.pokepack.user.User;

public record UserDto(
        Long id,
        String name,
        String email,
        long coins,
        int level,
        String avatarEmoji,
        String bio
) {
    public static UserDto from(User u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getCoins(), u.getLevel(), u.getAvatarEmoji(), u.getBio());
    }
}
