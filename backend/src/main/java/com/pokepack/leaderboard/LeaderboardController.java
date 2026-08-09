package com.pokepack.leaderboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private static final int DEFAULT_LIMIT = 10;

    private final LeaderboardRepository leaderboardRepository;

    public LeaderboardController(LeaderboardRepository leaderboardRepository) {
        this.leaderboardRepository = leaderboardRepository;
    }

    @GetMapping("/coins")
    public List<LeaderboardEntry> coins(@RequestParam(defaultValue = "" + DEFAULT_LIMIT) int limit) {
        return leaderboardRepository.topByCoins(limit);
    }

    @GetMapping("/collection")
    public List<LeaderboardEntry> collection(@RequestParam(defaultValue = "" + DEFAULT_LIMIT) int limit) {
        return leaderboardRepository.topByCollectionSize(limit);
    }

    @GetMapping("/complete-sets")
    public List<LeaderboardEntry> completeSets(@RequestParam(defaultValue = "" + DEFAULT_LIMIT) int limit) {
        return leaderboardRepository.topByCompleteSets(limit);
    }
}
