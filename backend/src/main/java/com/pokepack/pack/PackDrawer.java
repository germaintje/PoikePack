package com.pokepack.pack;

import com.pokepack.card.Card;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Zuivere RNG-logica voor pack-inhoud — geen Spring/DB-afhankelijkheden, puur om 'm makkelijk
 * en snel te kunnen unit-testen (zie PackDrawerTest). Dit is de server-side tegenhanger van
 * frontend/src/store/usePackStore.ts#openPack, die in de mockup client-side draait; hier is
 * dit de enige plek waar pack-inhoud daadwerkelijk bepaald wordt (zie docs/PROJECT_BRIEF.md
 * §2.1: "RNG en drop-rates zijn altijd server-side bepaald en gevalideerd — nooit client-side").
 *
 * Volgorde volgt het echte TCG-patroon: commons/uncommons eerst in willekeurige volgorde, dan
 * het reverse-holo slot, dan de hit-kaart(en) als climax, laatst.
 */
public class PackDrawer {

    private final Random random;

    public PackDrawer() {
        this(new SecureRandom());
    }

    /** Voor tests: geef een geseede Random mee voor deterministische uitkomsten. */
    public PackDrawer(Random random) {
        this.random = random;
    }

    public List<PulledCard> draw(List<Card> commonsPool, List<Card> uncommonsPool, List<Card> hitsPool, SlotCounts counts) {
        List<PulledCard> baseSlots = new ArrayList<>();
        for (Card c : drawWithoutReplacement(commonsPool, counts.commons())) {
            baseSlots.add(new PulledCard(c, false));
        }
        for (Card c : drawWithoutReplacement(uncommonsPool, counts.uncommons())) {
            baseSlots.add(new PulledCard(c, false));
        }
        shuffle(baseSlots);

        // Het reverse-holo slot trekt onafhankelijk uit dezelfde uncommon-pool — een kaart kan
        // dus zowel als gewone uncommon-pull als (apart) als reverse-holo-pull voorkomen in
        // dezelfde pack, net als in het echte TCG.
        List<PulledCard> reverseHoloSlots = new ArrayList<>();
        for (Card c : drawWithoutReplacement(uncommonsPool, counts.reverseHolo())) {
            reverseHoloSlots.add(new PulledCard(c, true));
        }

        List<PulledCard> hitSlots = new ArrayList<>();
        for (Card c : drawWithoutReplacement(hitsPool, counts.hits())) {
            hitSlots.add(new PulledCard(c, false));
        }

        List<PulledCard> ordered = new ArrayList<>(baseSlots.size() + reverseHoloSlots.size() + hitSlots.size());
        ordered.addAll(baseSlots);
        ordered.addAll(reverseHoloSlots);
        ordered.addAll(hitSlots);
        return ordered;
    }

    private List<Card> drawWithoutReplacement(List<Card> pool, int count) {
        List<Card> copy = new ArrayList<>(pool);
        List<Card> result = new ArrayList<>(Math.min(count, copy.size()));
        for (int i = 0; i < count && !copy.isEmpty(); i++) {
            int idx = random.nextInt(copy.size());
            result.add(copy.remove(idx));
        }
        return result;
    }

    private void shuffle(List<PulledCard> list) {
        for (int i = list.size() - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            PulledCard tmp = list.get(i);
            list.set(i, list.get(j));
            list.set(j, tmp);
        }
    }
}
