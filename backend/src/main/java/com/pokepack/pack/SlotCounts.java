package com.pokepack.pack;

public record SlotCounts(int commons, int uncommons, int reverseHolo, int hits) {

    public static SlotCounts of(PackType packType) {
        return new SlotCounts(
                packType.getSlotCommons(),
                packType.getSlotUncommons(),
                packType.getSlotReverseHolo(),
                packType.getSlotHits()
        );
    }

    public int total() {
        return commons + uncommons + reverseHolo + hits;
    }
}
