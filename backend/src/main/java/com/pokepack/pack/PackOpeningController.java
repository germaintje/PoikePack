package com.pokepack.pack;

import com.pokepack.common.AuthUtil;
import com.pokepack.pack.dto.PackOpenResponse;
import com.pokepack.pack.dto.PackTypeDto;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packs")
public class PackOpeningController {

    private final PackOpeningService packOpeningService;
    private final PackTypeRepository packTypeRepository;

    public PackOpeningController(PackOpeningService packOpeningService, PackTypeRepository packTypeRepository) {
        this.packOpeningService = packOpeningService;
        this.packTypeRepository = packTypeRepository;
    }

    @GetMapping
    public List<PackTypeDto> listPacks() {
        return packTypeRepository.findActiveWithSet().stream().map(PackTypeDto::from).toList();
    }

    @PostMapping("/{packTypeId}/open")
    public PackOpenResponse openPack(Authentication authentication, @PathVariable Long packTypeId) {
        return packOpeningService.openPack(AuthUtil.userId(authentication), packTypeId);
    }
}
