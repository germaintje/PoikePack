package com.pokepack.quest;

import com.pokepack.common.AuthUtil;
import com.pokepack.quest.dto.QuestStatusDto;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quests")
public class QuestController {

    private final QuestService questService;

    public QuestController(QuestService questService) {
        this.questService = questService;
    }

    @GetMapping
    public List<QuestStatusDto> list(Authentication authentication) {
        return questService.listWithProgress(AuthUtil.userId(authentication));
    }
}
