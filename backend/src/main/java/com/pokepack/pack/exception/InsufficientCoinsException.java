package com.pokepack.pack.exception;

public class InsufficientCoinsException extends RuntimeException {
    public InsufficientCoinsException(long have, long need) {
        super("Onvoldoende coins: heeft " + have + ", nodig " + need);
    }
}
