package com.pokepack.economy.exception;

public class DailyBonusAlreadyClaimedException extends RuntimeException {
    public DailyBonusAlreadyClaimedException() {
        super("Dagelijkse bonus is vandaag al geclaimd");
    }
}
