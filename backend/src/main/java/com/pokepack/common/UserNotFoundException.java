package com.pokepack.common;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("User " + id + " niet gevonden");
    }
}
