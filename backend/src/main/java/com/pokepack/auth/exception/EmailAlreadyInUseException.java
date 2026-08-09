package com.pokepack.auth.exception;

public class EmailAlreadyInUseException extends RuntimeException {
    public EmailAlreadyInUseException(String email) {
        super("E-mailadres is al in gebruik: " + email);
    }
}
