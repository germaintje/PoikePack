package com.pokepack.pack.dto;

import com.pokepack.pack.PackType;

public record PackTypeDto(
        Long id,
        String name,
        String setId,
        String setName,
        String logoUrl,
        int price,
        int unlockLevel,
        int slotCommons,
        int slotUncommons,
        int slotReverseHolo,
        int slotHits
) {
    public static PackTypeDto from(PackType pt) {
        return new PackTypeDto(
                pt.getId(),
                pt.getName(),
                pt.getSet().getId(),
                pt.getSet().getName(),
                pt.getSet().getLogoUrl(),
                pt.getPrice(),
                pt.getUnlockLevel(),
                pt.getSlotCommons(),
                pt.getSlotUncommons(),
                pt.getSlotReverseHolo(),
                pt.getSlotHits()
        );
    }
}
