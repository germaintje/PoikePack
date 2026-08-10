package com.pokepack.achievement;

import com.pokepack.achievement.dto.AchievementStatusDto;
import com.pokepack.binder.UserCard;
import com.pokepack.binder.UserCardRepository;
import com.pokepack.card.CardRepository;
import com.pokepack.economy.Transaction;
import com.pokepack.economy.TransactionRepository;
import com.pokepack.economy.TransactionType;
import com.pokepack.pack.PackOpeningRepository;
import com.pokepack.user.User;
import com.pokepack.user.UserStats;
import com.pokepack.user.UserStatsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Data-driven i.p.v. een switch per losse achievement-code: elke achievement heeft een `metric`
 * (en voor set_complete/set_holo_pulled een `set_id`) — checkAndAward berekent één keer per
 * pack-opening de huidige waarde per metric, en toetst daar alle ~450 achievements tegen. Zie
 * database/migrations/V11 voor waar die achievements vandaan komen.
 */
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

    /** Checkt alle achievement-condities en kent nieuw-gehaalde meteen coins+xp toe. Bedoeld om
     * na elke pack-opening aangeroepen te worden (zie PackOpeningService). */
    @Transactional
    public List<Achievement> checkAndAward(User user) {
        Long userId = user.getId();

        Set<Long> alreadyUnlockedIds = userAchievementRepository.findAllByUserId(userId).stream()
                .map(ua -> ua.getAchievement().getId())
                .collect(Collectors.toSet());

        long packsOpened = packOpeningRepository.countByUser_Id(userId);
        UserStats stats = userStatsService.getOrCreateStats(userId);

        // Eén doorloop van alle bezeten kaarten geeft zowel per-set completion als per-set
        // holo-bezit — voorkomt twee losse queries/doorlopen voor twee verschillende dingen.
        Map<String, Set<String>> ownedCardIdsBySet = new HashMap<>();
        Set<String> setsWithHoloOrBetter = new HashSet<>();
        for (UserCard uc : userCardRepository.findAllByUserIdWithCardAndSet(userId)) {
            String setId = uc.getCard().getSet().getId();
            ownedCardIdsBySet.computeIfAbsent(setId, k -> new HashSet<>()).add(uc.getCard().getId());
            if (!uc.getCard().isCommonOrUncommon()) {
                setsWithHoloOrBetter.add(setId);
            }
        }
        Set<String> completeSetIds = new HashSet<>();
        for (var entry : ownedCardIdsBySet.entrySet()) {
            long total = cardRepository.countBySetId(entry.getKey());
            if (total > 0 && entry.getValue().size() >= total) completeSetIds.add(entry.getKey());
        }

        Map<String, Long> metricValues = Map.of(
                "packs_opened", packsOpened,
                "cards_collected", (long) stats.getCardsCollectedTotal(),
                "coins_earned", stats.getCoinsEarnedTotal(),
                "coins_spent", stats.getCoinsSpentTotal(),
                "complete_sets", (long) completeSetIds.size(),
                "level_reached", (long) user.getLevel(),
                "daily_streak", (long) user.getDailyStreak()
        );
        boolean hasHoloAnywhere = !setsWithHoloOrBetter.isEmpty();

        List<Achievement> unlocked = new ArrayList<>();
        for (Achievement ach : achievementRepository.findAll()) {
            if (alreadyUnlockedIds.contains(ach.getId())) continue;

            boolean met = switch (ach.getMetric()) {
                case "first_holo" -> hasHoloAnywhere;
                case "set_complete" -> ach.getSetId() != null && completeSetIds.contains(ach.getSetId());
                case "set_holo_pulled" -> ach.getSetId() != null && setsWithHoloOrBetter.contains(ach.getSetId());
                default -> {
                    Long value = metricValues.get(ach.getMetric());
                    yield value != null && value >= ach.getThreshold();
                }
            };

            if (met) {
                userAchievementRepository.save(new UserAchievement(user, ach));
                user.setCoins(user.getCoins() + ach.getRewardCoins());
                user.addXp(ach.getRewardXp());
                transactionRepository.save(new Transaction(user, TransactionType.ACHIEVEMENT_REWARD,
                        ach.getRewardCoins(), "Achievement: " + ach.getName()));
                userStatsService.recordCoinsEarned(userId, ach.getRewardCoins());
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
}
