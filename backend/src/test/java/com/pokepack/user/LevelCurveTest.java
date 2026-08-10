package com.pokepack.user;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LevelCurveTest {

    @Test
    void startsAtLevelOneWithZeroXp() {
        assertThat(LevelCurve.levelForXp(0)).isEqualTo(1);
        assertThat(LevelCurve.levelForXp(59)).isEqualTo(1);
    }

    @Test
    void levelFiveRequiresExactlySixHundredXp() {
        assertThat(LevelCurve.xpRequiredForLevel(5)).isEqualTo(600);
        assertThat(LevelCurve.levelForXp(599)).isEqualTo(4);
        assertThat(LevelCurve.levelForXp(600)).isEqualTo(5);
    }

    @Test
    void levelTwentyFiveRequiresEighteenThousandXp() {
        assertThat(LevelCurve.xpRequiredForLevel(25)).isEqualTo(18_000);
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
