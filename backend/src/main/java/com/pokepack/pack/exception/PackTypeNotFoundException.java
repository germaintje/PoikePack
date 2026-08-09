package com.pokepack.pack.exception;

public class PackTypeNotFoundException extends RuntimeException {
    public PackTypeNotFoundException(Long id) {
        super("Pack type " + id + " niet gevonden of niet actief");
    }
}
