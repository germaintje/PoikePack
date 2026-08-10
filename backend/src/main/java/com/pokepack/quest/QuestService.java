package com.pokepack.quest;

import com.pokepack.economy.Transaction;
import com.pokepack.economy.TransactionRepository;
import com.pokepack.economy.TransactionType;
import com.pokepack.quest.dto.QuestStatusDto;
import com.pokepack.user.User;
import com.pokepack.user.UserStatsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Elke quest heeft een metric (packs_opened, cards_collected, coins_earned, coins_spent) die
 * bepaalt welk deel van een pack-opening 'm voortgang geeft — zie recordProgress. Metrics volgen
 * bewust dezelfde namen als de UserStats-tellers waar ze conceptueel bij horen.
 */
@Service
public class QuestService {

    private final QuestRepository questRepository;
    private final UserQuestProgressRepository progressRepository;
    private final TransactionRepository transactionRepository;
    private final UserStatsService userStatsService;

    public QuestService(
            QuestRepository questRepository,
            UserQuestProgressRepository progressRepository,
            TransactionRepository transactionRepository,
            UserStatsService userStatsService
    ) {
        this.questRepository = questRepository;
        this.progressRepository = progressRepository;
        this.transactionRepository = transactionRepository;
        this.userStatsService = userStatsService;
    }

    static String periodKeyFor(String period, LocalDate today) {
        return switch (period) {
            case "daily" -> today.toString();
            case "weekly" -> {
                WeekFields wf = WeekFields.ISO;
                yield today.get(wf.weekBasedYear()) + "-W" + String.format(Locale.ROOT, "%02d", today.get(wf.weekOfWeekBasedYear()));
            }
            case "monthly" -> today.getYear() + "-" + String.format(Locale.ROOT, "%02d", today.getMonthValue());
            default -> "once";
        };
    }

    /** Geeft voortgang aan elke actieve quest waarvan de metric in `metricAmounts` voorkomt, met
     * het bijbehorende bedrag (bv. {"packs_opened":1, "cards_collected":4}). Retourneert de
     * namen van quests die door dit ene record-moment nieuw voltooid zijn (voor UI-feedback). */
    @Transactional
    public List<String> recordProgress(User user, Map<String, Integer> metricAmounts) {
        LocalDate today = LocalDate.now();
        List<String> newlyCompleted = new ArrayList<>();

        for (Quest quest : questRepository.findByActiveTrue()) {
            Integer amount = metricAmounts.get(quest.getMetric());
            if (amount == null || amount <= 0) continue;

            String periodKey = periodKeyFor(quest.getPeriod(), today);
            UserQuestProgress progress = progressRepository
                    .findCurrent(user.getId(), quest.getId(), periodKey)
                    .orElseGet(() -> new UserQuestProgress(user, quest, periodKey));

            if (progress.isCompleted()) continue;

            progress.incrementProgress(amount);
            if (progress.getProgress() >= quest.getTargetCount()) {
                progress.markCompleted();
                user.setCoins(user.getCoins() + quest.getRewardCoins());
                user.addXp(quest.getRewardXp());
                transactionRepository.save(new Transaction(user, TransactionType.QUEST_REWARD,
                        quest.getRewardCoins(), "Quest voltooid: " + quest.getName()));
                userStatsService.recordCoinsEarned(user.getId(), quest.getRewardCoins());
                newlyCompleted.add(quest.getName());
            }
            progressRepository.save(progress);
        }
        return newlyCompleted;
    }

    @Transactional(readOnly = true)
    public List<QuestStatusDto> listWithProgress(Long userId) {
        LocalDate today = LocalDate.now();
        List<Quest> quests = questRepository.findByActiveTrue();

        // Elke quest kan een andere periode (dus period_key) hebben, dus per unieke period_key
        // één query i.p.v. per quest — voorkomt N+1 zonder de logica ingewikkelder te maken dan
        // nodig voor het handjevol quests dat er nu is.
        Map<String, List<UserQuestProgress>> byPeriodKey = quests.stream()
                .map(q -> periodKeyFor(q.getPeriod(), today))
                .distinct()
                .collect(Collectors.toMap(pk -> pk, pk -> progressRepository.findAllForUserInPeriod(userId, pk)));

        return quests.stream().map(quest -> {
            String periodKey = periodKeyFor(quest.getPeriod(), today);
            UserQuestProgress progress = byPeriodKey.get(periodKey).stream()
                    .filter(p -> p.getId().getQuestId().equals(quest.getId()))
                    .findFirst()
                    .orElse(null);
            return new QuestStatusDto(
                    quest.getCode(), quest.getName(), quest.getDescription(), quest.getPeriod(),
                    quest.getTargetCount(), quest.getRewardCoins(), quest.getRewardXp(),
                    progress != null ? progress.getProgress() : 0,
                    progress != null && progress.isCompleted()
            );
        }).toList();
    }
}
