package com.pokepack.achievement;

import com.pokepack.achievement.dto.AchievementStatusDto;
import com.pokepack.common.AuthUtil;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public List<AchievementStatusDto> list(Authentication authentication) {
        return achievementService.listWithStatus(AuthUtil.userId(authentication));
    }
}
