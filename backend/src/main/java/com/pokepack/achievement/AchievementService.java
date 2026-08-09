package com.pokepack.achievement;

import com.pokepack.achievement.dto.AchievementStatusDto;
import com.pokepack.binder.UserCardRepository;
import com.pokepack.card.CardRepository;
import com.pokepack.economy.Transaction;
import com.pokepack.economy.TransactionRepository;
import com.pokepack.economy.TransactionType;
import com.pokepack.pack.PackOpeningRepository;
import com.pokepack.user.User;
import com.pokepack.user.UserStatsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserCardRepository userCardRepository;
    private final CardRepository cardRepository;
    private final PackOpeningRepository packOpeningRepository;
    private final TransactionRepository transactionRepository;
    private final UserStatsService userStatsService;

    public AchievementService(
            AchievementRepository achievementRepository,
            UserAchievementRepository userAchievementRepository,
            UserCardRepository userCardRepository,
            CardRepository cardRepository,
            PackOpeningRepository packOpeningRepository,
            TransactionRepository transactionRepository,
            UserStatsService userStatsService
    ) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.userCardRepository = userCardRepository;
        this.cardRepository = cardRepository;
        this.packOpeningRepository = packOpeningRepository;
        this.transactionRepository = transactionRepository;
        this.userStatsService = userStatsService;
    }

    /** Checkt alle achievement-condities en kent nieuw-gehaalde meteen coins toe. Bedoeld om na
     * elke pack-opening aangeroepen te worden (zie PackOpeningService). */
    @Transactional
    public List<Achievement> checkAndAward(User user) {
        long packsOpened = packOpeningRepository.countByUser_Id(user.getId());
        boolean hasHolo = userCardRepository.hasAnyHoloOrBetter(user.getId());
        long completeSets = countCompleteSets(user.getId());

        List<Achievement> unlocked = new ArrayList<>();
        for (Achievement ach : achievementRepository.findAll()) {
            if (userAchievementRepository.existsByUser_IdAndAchievement_Id(user.getId(), ach.getId())) continue;

            boolean met = switch (ach.getCode()) {
                case "first_holo" -> hasHolo;
                case "first_complete_set" -> completeSets >= 1;
                case "packs_opened_10" -> packsOpened >= 10;
                case "packs_opened_100" -> packsOpened >= 100;
                default -> false;
            };

            if (met) {
                userAchievementRepository.save(new UserAchievement(user, ach));
                user.setCoins(user.getCoins() + ach.getRewardCoins());
                user.addXp(ach.getRewardXp());
                transactionRepository.save(new Transaction(user, TransactionType.ACHIEVEMENT_REWARD,
                        ach.getRewardCoins(), "Achievement: " + ach.getName()));
                userStatsService.recordCoinsEarned(user.getId(), ach.getRewardCoins());
                unlocked.add(ach);
            }
        }
        return unlocked;
    }

    @Transactional(readOnly = true)
    public List<AchievementStatusDto> listWithStatus(Long userId) {
        Map<Long, UserAchievement> unlockedByAchievementId = userAchievementRepository.findAllByUserId(userId).stream()
                .collect(Collectors.toMap(ua -> ua.getAchievement().getId(), ua -> ua));

        return achievementRepository.findAll().stream()
                .map(ach -> {
                    UserAchievement ua = unlockedByAchievementId.get(ach.getId());
                    return new AchievementStatusDto(
                            ach.getCode(), ach.getName(), ach.getDescription(), ach.getRewardCoins(), ach.getRewardXp(),
                            ua != null, ua != null ? ua.getUnlockedAt() : null
                    );
                })
                .toList();
    }

    private long countCompleteSets(Long userId) {
        Map<String, Set<String>> ownedCardIdsBySet = new HashMap<>();
        for (var row : userCardRepository.findOwnedCardSetPairs(userId)) {
            ownedCardIdsBySet.computeIfAbsent(row.getSetId(), k -> new HashSet<>()).add(row.getCardId());
        }
        long complete = 0;
        for (var entry : ownedCardIdsBySet.entrySet()) {
            long total = cardRepository.countBySetId(entry.getKey());
            if (total > 0 && entry.getValue().size() >= total) complete++;
        }
        return complete;
    }
}
