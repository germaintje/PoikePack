package com.pokepack.economy;

/**
 * Verkoopwaarde per rarity-tier. Zelfde tier-indeling en trefwoord-bucketing als
 * frontend/src/lib/rarity.ts, en dezelfde richtwaarden als docs/PROJECT_BRIEF.md §2.2
 * (Common=5, Uncommon=15, Rare=50, Holo/EX/V+=150+).
 */
public final class CardValuation {

    private CardValuation() {
    }

    public static final int DUPLICATE_BONUS = 2;

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
