package com.pokepack.auth.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Onjuist e-mailadres of wachtwoord");
    }
}
