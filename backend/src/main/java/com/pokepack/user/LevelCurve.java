package com.pokepack.user;

/**
 * Puur & unit-getest (net als PackDrawer): bepaalt speler-level uit totale XP. De cumulatieve
 * XP-drempel voor level L is 30 * L * (L-1) — level 2 op 60 XP (snel bereikt), level 25 op
 * 18.000 XP.
 *
 * Level 25 is bewust de top van sync-job/src/reprice.ts se pack-unlock-tiers (MAX_LEVEL): met
 * de huidige XP-bronnen (packs, nieuwe kaarten, ~350+ achievements, ~25 quests) is 18k XP een
 * serieus maar haalbaar einddoel over meerdere speelsessies, niet iets je in een paar minuten
 * dichtspeelt. Verlaag de constante (30) als spelers te langzaam levelen, verhoog 'm als het te
 * snel gaat — de rest van het systeem (unlock-tiers, packprijzen) hoeft dan niet mee te
 * veranderen.
 */
public final class LevelCurve {

    private LevelCurve() {
    }

    public static int levelForXp(long xp) {
        int level = 1;
        while (xp >= xpRequiredForLevel(level + 1)) {
            level++;
        }
        return level;
    }

    public static long xpRequiredForLevel(int level) {
        return 30L * level * (level - 1);
    }
}
