package com.pokepack.economy;

import com.pokepack.common.AuthUtil;
import com.pokepack.economy.dto.DailyBonusResponse;
import com.pokepack.economy.dto.SellDuplicatesResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/economy")
public class EconomyController {

    private final EconomyService economyService;

    public EconomyController(EconomyService economyService) {
        this.economyService = economyService;
    }

    @PostMapping("/daily-bonus")
    public DailyBonusResponse claimDailyBonus(Authentication authentication) {
        return economyService.claimDailyBonus(AuthUtil.userId(authentication));
    }

    @PostMapping("/sell-duplicates")
    public SellDuplicatesResponse sellDuplicates(Authentication authentication) {
        return economyService.sellDuplicates(AuthUtil.userId(authentication));
    }
}
