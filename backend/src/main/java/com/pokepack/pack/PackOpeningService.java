package com.pokepack.pack;

import com.pokepack.achievement.Achievement;
import com.pokepack.achievement.AchievementService;
import com.pokepack.binder.UserCard;
import com.pokepack.binder.UserCardRepository;
import com.pokepack.card.Card;
import com.pokepack.card.CardRepository;
import com.pokepack.common.UserNotFoundException;
import com.pokepack.economy.CardValuation;
import com.pokepack.economy.Transaction;
import com.pokepack.economy.TransactionRepository;
import com.pokepack.economy.TransactionType;
import com.pokepack.pack.dto.PackOpenResponse;
import com.pokepack.pack.dto.PulledCardDto;
import com.pokepack.pack.exception.InsufficientCoinsException;
import com.pokepack.pack.exception.PackLockedException;
import com.pokepack.pack.exception.PackTypeNotFoundException;
import com.pokepack.quest.QuestService;
import com.pokepack.user.LevelCurve;
import com.pokepack.user.User;
import com.pokepack.user.UserRepository;
import com.pokepack.user.UserStatsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Enige plek waar pack-inhoud wordt bepaald en gevalideerd — zie docs/PROJECT_BRIEF.md §2.1.
 * De client vraagt "open pack X" aan; deze service bepaalt en persisteert het resultaat, en
 * triggert meteen de rest van de economie die aan een pack-opening hangt: duplicate-bonus,
 * set-completion-bonus, quest-voortgang en achievements.
 */
@Service
public class PackOpeningService {

    private final UserRepository userRepository;
    private final PackTypeRepository packTypeRepository;
    private final CardRepository cardRepository;
    private final UserCardRepository userCardRepository;
    private final TransactionRepository transactionRepository;
    private final PackOpeningRepository packOpeningRepository;
    private final QuestService questService;
    private final AchievementService achievementService;
    private final UserStatsService userStatsService;
    private final PackDrawer packDrawer;
    private final int setCompletionBonusCoins;
    private final int packOpenXp;
    private final int newCardXp;

    public PackOpeningService(
            UserRepository userRepository,
            PackTypeRepository packTypeRepository,
            CardRepository cardRepository,
            UserCardRepository userCardRepository,
            TransactionRepository transactionRepository,
            PackOpeningRepository packOpeningRepository,
            QuestService questService,
            AchievementService achievementService,
            UserStatsService userStatsService,
            @Value("${pokepack.set-completion-bonus-coins:500}") int setCompletionBonusCoins,
            @Value("${pokepack.pack-open-xp:20}") int packOpenXp,
            @Value("${pokepack.new-card-xp:8}") int newCardXp
    ) {
        this.userRepository = userRepository;
        this.packTypeRepository = packTypeRepository;
        this.cardRepository = cardRepository;
        this.userCardRepository = userCardRepository;
        this.transactionRepository = transactionRepository;
        this.packOpeningRepository = packOpeningRepository;
        this.questService = questService;
        this.achievementService = achievementService;
        this.userStatsService = userStatsService;
        this.setCompletionBonusCoins = setCompletionBonusCoins;
        this.packOpenXp = packOpenXp;
        this.newCardXp = newCardXp;
        this.packDrawer = new PackDrawer();
    }

    @Transactional
    public PackOpenResponse openPack(Long userId, Long packTypeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        PackType packType = packTypeRepository.findById(packTypeId)
                .filter(PackType::isActive)
                .orElseThrow(() -> new PackTypeNotFoundException(packTypeId));

        if (user.getLevel() < packType.getUnlockLevel()) {
            throw new PackLockedException(user.getLevel(), packType.getUnlockLevel());
        }
        if (user.getCoins() < packType.getPrice()) {
            throw new InsufficientCoinsException(user.getCoins(), packType.getPrice());
        }

        String setId = packType.getSet().getId();
        boolean setWasComplete = isSetComplete(setId, userId);

        List<Card> commons = cardRepository.findCommons(setId);
        List<Card> uncommons = cardRepository.findUncommons(setId);
        List<Card> hits = cardRepository.findHits(setId);

        List<PulledCard> pulls = packDrawer.draw(commons, uncommons, hits, SlotCounts.of(packType));

        user.setCoins(user.getCoins() - packType.getPrice());
        user.addXp(packOpenXp);
        transactionRepository.save(new Transaction(user, TransactionType.PACK_OPEN,
                -packType.getPrice(), "Open " + packType.getName()));
        userStatsService.recordPackOpened(userId);
        userStatsService.recordCoinsSpent(userId, packType.getPrice());

        List<PulledCardDto> dtos = new ArrayList<>(pulls.size());
        // Houdt kaarten bij die al binnen déze pack-opening zijn geraakt, zodat een dubbele
        // pull van dezelfde kaart in dezelfde pack (bv. gewone uncommon + reverse-holo van
        // dezelfde kaart) correct als duplicate telt zonder op impliciet flush-gedrag van de
        // persistence context te hoeven vertrouwen.
        Map<String, UserCard> touchedThisOpening = new HashMap<>();

        for (PulledCard pull : pulls) {
            Card card = pull.card();
            UserCard userCard = touchedThisOpening.get(card.getId());
            boolean isDuplicate;

            if (userCard != null) {
                isDuplicate = true;
            } else {
                userCard = userCardRepository.findByUserIdAndCardId(userId, card.getId()).orElse(null);
                isDuplicate = userCard != null;
                if (userCard == null) {
                    userCard = new UserCard(user, card, 0);
                }
            }
            userCard.incrementQuantity(1);
            userCardRepository.save(userCard);
            touchedThisOpening.put(card.getId(), userCard);

            if (isDuplicate) {
                user.setCoins(user.getCoins() + CardValuation.DUPLICATE_BONUS);
                transactionRepository.save(new Transaction(user, TransactionType.DUPLICATE_BONUS,
                        CardValuation.DUPLICATE_BONUS, "Duplicate: " + card.getName()));
                userStatsService.recordCoinsEarned(userId, CardValuation.DUPLICATE_BONUS);
            } else {
                userStatsService.recordCardCollected(userId);
                user.addXp(newCardXp);
            }

            dtos.add(new PulledCardDto(
                    card.getId(), card.getName(), card.getSet().getName(), card.getNumber(),
                    card.getRarity(), card.getImageLargeUrl(), pull.reverseHolo(), isDuplicate,
                    CardValuation.sellValueFor(card.getRarity())
            ));
        }

        String pulledIds = pulls.stream().map(p -> p.card().getId()).collect(Collectors.joining(","));
        PackOpening opening = packOpeningRepository.save(
                new PackOpening(user, packType, pulledIds, packType.getPrice()));

        Integer awardedSetCompletionBonus = null;
        if (!setWasComplete && isSetComplete(setId, userId)) {
            user.setCoins(user.getCoins() + setCompletionBonusCoins);
            transactionRepository.save(new Transaction(user, TransactionType.SET_COMPLETION_BONUS,
                    setCompletionBonusCoins, "Set compleet: " + packType.getSet().getName()));
            userStatsService.recordCoinsEarned(userId, setCompletionBonusCoins);
            awardedSetCompletionBonus = setCompletionBonusCoins;
        }

        questService.recordPackOpened(user);
        List<Achievement> unlockedAchievements = achievementService.checkAndAward(user);

        return new PackOpenResponse(
                opening.getId(), packType.getPrice(), user.getCoins(), dtos,
                awardedSetCompletionBonus,
                unlockedAchievements.stream().map(Achievement::getName).toList(),
                user.getLevel(), user.getXp(), LevelCurve.xpRequiredForLevel(user.getLevel() + 1)
        );
    }

    private boolean isSetComplete(String setId, Long userId) {
        long total = cardRepository.countBySetId(setId);
        if (total == 0) return false;
        long owned = userCardRepository.findOwnedCardSetPairs(userId).stream()
                .filter(p -> p.getSetId().equals(setId))
                .map(UserCardRepository.OwnedCardSetProjection::getCardId)
                .distinct()
                .count();
        return owned >= total;
    }
}
