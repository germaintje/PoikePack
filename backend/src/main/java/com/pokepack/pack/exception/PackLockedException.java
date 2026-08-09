package com.pokepack.pack.exception;

public class PackLockedException extends RuntimeException {
    public PackLockedException(int userLevel, int requiredLevel) {
        super("Pack vereist level " + requiredLevel + ", speler is level " + userLevel);
    }
}
