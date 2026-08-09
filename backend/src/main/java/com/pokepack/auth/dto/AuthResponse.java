package com.pokepack.auth.dto;

import com.pokepack.user.dto.UserDto;

public record AuthResponse(String token, UserDto user) {
}
