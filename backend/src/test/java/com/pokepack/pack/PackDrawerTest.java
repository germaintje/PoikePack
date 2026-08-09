package com.pokepack.pack;

import com.pokepack.card.Card;
import com.pokepack.card.CardSet;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class PackDrawerTest {

    private static List<Card> cards(String prefix, int count, CardSet set, String rarity) {
        return IntStream.range(0, count)
                .mapToObj(i -> new Card(prefix + i, set, prefix + i, String.valueOf(i), rarity))
                .toList();
    }

    @Test
    void drawsExactlyTheConfiguredSlotCounts() {
        CardSet set = new CardSet("base1", "Base Set");
        List<Card> commons = cards("c", 20, set, "Common");
        List<Card> uncommons = cards("u", 10, set, "Uncommon");
        List<Card> hits = cards("h", 5, set, "Rare Holo");

        SlotCounts counts = new SlotCounts(5, 2, 1, 1);
        PackDrawer drawer = new PackDrawer(new Random(42));

        List<PulledCard> pulls = drawer.draw(commons, uncommons, hits, counts);

        assertThat(pulls).hasSize(counts.total());
        assertThat(pulls.stream().filter(p -> !p.reverseHolo()).filter(p -> "Common".equals(p.card().getRarity())).count())
                .isEqualTo(5);
        assertThat(pulls.stream().filter(p -> !p.reverseHolo()).filter(p -> "Uncommon".equals(p.card().getRarity())).count())
                .isEqualTo(2);
        assertThat(pulls.stream().filter(PulledCard::reverseHolo).count()).isEqualTo(1);
        assertThat(pulls.stream().filter(p -> "Rare Holo".equals(p.card().getRarity())).count()).isEqualTo(1);
    }

    @Test
    void hitSlotIsAlwaysLastAndReverseHoloComesBeforeIt() {
        CardSet set = new CardSet("base1", "Base Set");
        List<Card> commons = cards("c", 20, set, "Common");
        List<Card> uncommons = cards("u", 10, set, "Uncommon");
        List<Card> hits = cards("h", 5, set, "Rare Holo");

        SlotCounts counts = new SlotCounts(5, 2, 1, 1);
        PackDrawer drawer = new PackDrawer(new Random(7));

        List<PulledCard> pulls = drawer.draw(commons, uncommons, hits, counts);

        PulledCard last = pulls.get(pulls.size() - 1);
        assertThat(last.card().getRarity()).isEqualTo("Rare Holo");

        PulledCard secondToLast = pulls.get(pulls.size() - 2);
        assertThat(secondToLast.reverseHolo()).isTrue();
    }

    @Test
    void neverDrawsTheSameCardTwiceWithinTheSameBaseSlot() {
        CardSet set = new CardSet("base1", "Base Set");
        List<Card> commons = cards("c", 5, set, "Common"); // klein genoeg om herhaling te forceren als het fout gaat
        List<Card> uncommons = cards("u", 5, set, "Uncommon");
        List<Card> hits = cards("h", 5, set, "Rare Holo");

        SlotCounts counts = new SlotCounts(5, 0, 0, 0);
        PackDrawer drawer = new PackDrawer(new Random(1));

        List<PulledCard> pulls = drawer.draw(commons, uncommons, hits, counts);

        assertThat(pulls).extracting(p -> p.card().getId()).doesNotHaveDuplicates();
    }

    @Test
    void gracefullyDrawsFewerCardsWhenPoolIsSmallerThanRequested() {
        CardSet set = new CardSet("base1", "Base Set");
        List<Card> commons = cards("c", 2, set, "Common"); // pool kleiner dan gevraagde 5
        List<Card> uncommons = List.of();
        List<Card> hits = List.of();

        SlotCounts counts = new SlotCounts(5, 0, 0, 0);
        PackDrawer drawer = new PackDrawer(new Random(3));

        List<PulledCard> pulls = drawer.draw(commons, uncommons, hits, counts);

        assertThat(pulls).hasSize(2); // geen crash, gewoon zoveel als er zijn
    }
}
