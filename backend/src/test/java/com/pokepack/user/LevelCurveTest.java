package com.pokepack.user;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LevelCurveTest {

    @Test
    void startsAtLevelOneWithZeroXp() {
        assertThat(LevelCurve.levelForXp(0)).isEqualTo(1);
        assertThat(LevelCurve.levelForXp(99)).isEqualTo(1);
    }

    @Test
    void levelFiveRequiresExactlyOneThousandXp() {
        assertThat(LevelCurve.xpRequiredForLevel(5)).isEqualTo(1000);
        assertThat(LevelCurve.levelForXp(999)).isEqualTo(4);
        assertThat(LevelCurve.levelForXp(1000)).isEqualTo(5);
    }

    @Test
    void levelIncreasesMonotonicallyWithXp() {
        int previous = LevelCurve.levelForXp(0);
        for (long xp = 0; xp <= 5000; xp += 37) {
            int level = LevelCurve.levelForXp(xp);
            assertThat(level).isGreaterThanOrEqualTo(previous);
            previous = level;
        }
    }

    @Test
    void xpRequiredForLevelRoundTripsWithLevelForXp() {
        for (int level = 1; level <= 20; level++) {
            long threshold = LevelCurve.xpRequiredForLevel(level);
            assertThat(LevelCurve.levelForXp(threshold)).isGreaterThanOrEqualTo(level);
        }
    }
}
