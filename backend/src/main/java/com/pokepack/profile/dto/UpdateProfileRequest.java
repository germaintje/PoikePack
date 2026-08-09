package com.pokepack.profile.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 80) String name,
        @Size(max = 8) String avatarEmoji,
        @Size(max = 280) String bio
) {
}
