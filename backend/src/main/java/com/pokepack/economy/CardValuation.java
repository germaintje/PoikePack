package com.pokepack.economy;

import java.math.BigDecimal;

/**
 * Verkoopwaarde per kaart. Basis is de rarity-tier-tabel (zelfde tier-indeling en
 * trefwoord-bucketing als frontend/src/lib/rarity.ts) — die blijft de vloer/fallback voor kaarten
 * zonder marktdata. Heeft de kaart een echte marktwaarde (sync-job, tcgplayer/cardmarket), dan
 * wint het hoogste van de twee: zo trekt een vintage holo die écht honderden euro's waard is de
 * verkoopprijs omhoog, zonder de bestaande, al gebalanceerde tier-waarden ooit te laten zakken.
 *
 * SELL_FRACTION is bewust < 1: dupes verkopen geeft een deel van de marktwaarde, niet de volle
 * mep — dat houdt "meer packs openen" aantrekkelijker dan "verkopen en wachten".
 */
public final class CardValuation {

    private CardValuation() {
    }

    public static final int DUPLICATE_BONUS = 2;

    private static final int COIN_PER_DOLLAR = 8; // zelfde koers als sync-job/src/reprice.ts
    private static final double SELL_FRACTION = 0.4;

    public static int sellValueFor(String rarity, BigDecimal marketValueUsd) {
        int tierValue = sellValueFor(rarity);
        if (marketValueUsd == null) return tierValue;

        int marketValue = (int) Math.round(marketValueUsd.doubleValue() * COIN_PER_DOLLAR * SELL_FRACTION);
        return Math.max(tierValue, marketValue);
    }

    public static int sellValueFor(String rarity) {
        return switch (tierOf(rarity)) {
            case COMMON -> 5;
            case UNCOMMON -> 15;
            case RARE -> 50;
            case HOLO -> 150;
            case ULTRA -> 320;
            case SECRET -> 600;
        };
    }

    private enum Tier { COMMON, UNCOMMON, RARE, HOLO, ULTRA, SECRET }

    private static Tier tierOf(String rarity) {
        if (rarity == null) return Tier.COMMON;
        String r = rarity.toLowerCase();
        if (r.equals("common")) return Tier.COMMON;
        if (r.equals("uncommon")) return Tier.UNCOMMON;
        if (r.contains("secret") || r.contains("hyper") || r.contains("rainbow")
                || r.contains("special illustration") || r.contains("gold")) {
            return Tier.SECRET;
        }
        if (r.contains("ultra") || r.contains("double rare") || r.contains("illustration")
                || r.contains("ace spec") || r.contains("vmax") || r.contains("vstar") || r.endsWith("ex")) {
            return Tier.ULTRA;
        }
        if (r.contains("holo") || r.contains("reverse")) return Tier.HOLO;
        return Tier.RARE;
    }
}
