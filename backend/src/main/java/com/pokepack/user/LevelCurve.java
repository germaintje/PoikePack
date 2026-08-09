package com.pokepack.user;

/**
 * Puur & unit-getest (net als PackDrawer): bepaalt speler-level uit totale XP. De cumulatieve
 * XP-drempel voor level L is 50 * L * (L-1) — level 2 op 100 XP, level 5 op 1000 XP (de drempel
 * voor de "151"-pack, zie pack_types.unlock_level), oplopend steiler naarmate je hoger komt.
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
        return 50L * level * (level - 1);
    }
}
