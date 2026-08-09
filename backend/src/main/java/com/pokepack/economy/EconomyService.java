package com.pokepack.economy;

import com.pokepack.binder.UserCard;
import com.pokepack.binder.UserCardRepository;
import com.pokepack.common.UserNotFoundException;
import com.pokepack.economy.dto.DailyBonusResponse;
import com.pokepack.economy.dto.SellDuplicatesResponse;
import com.pokepack.economy.exception.DailyBonusAlreadyClaimedException;
import com.pokepack.user.User;
import com.pokepack.user.UserRepository;
import com.pokepack.user.UserStatsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EconomyService {

    /** Streak-bonus loopt op tot en met dag 7, daarna vlakt 'ie af — voorkomt dat de coin-inflow
     * ongelimiteerd blijft groeien voor spelers met een heel lange streak. */
    private static final int MAX_STREAK_BONUS_DAYS = 7;
    private static final int STREAK_BONUS_PER_DAY = 5;

    private final UserRepository userRepository;
    private final UserCardRepository userCardRepository;
    private final TransactionRepository transactionRepository;
    private final UserStatsService userStatsService;
    private final int dailyBonusCoins;

    public EconomyService(
            UserRepository userRepository,
            UserCardRepository userCardRepository,
            TransactionRepository transactionRepository,
            UserStatsService userStatsService,
            @Value("${pokepack.daily-bonus-coins:25}") int dailyBonusCoins
    ) {
        this.userRepository = userRepository;
        this.userCardRepository = userCardRepository;
        this.transactionRepository = transactionRepository;
        this.userStatsService = userStatsService;
        this.dailyBonusCoins = dailyBonusCoins;
    }

    @Transactional
    public DailyBonusResponse claimDailyBonus(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));

        LocalDate today = LocalDate.now();
        LocalDate last = user.getLastDailyBonusDate();

        if (today.equals(last)) {
            throw new DailyBonusAlreadyClaimedException();
        }

        int streak = today.equals(last == null ? null : last.plusDays(1)) ? user.getDailyStreak() + 1 : 1;
        int streakBonus = Math.min(streak - 1, MAX_STREAK_BONUS_DAYS) * STREAK_BONUS_PER_DAY;
        int awarded = dailyBonusCoins + streakBonus;

        user.setDailyStreak(streak);
        user.setLastDailyBonusDate(today);
        user.setCoins(user.getCoins() + awarded);
        transactionRepository.save(new Transaction(user, TransactionType.DAILY_BONUS, awarded,
                "Dagelijkse bonus (streak " + streak + ")"));
        userStatsService.recordCoinsEarned(userId, awarded);

        return new DailyBonusResponse(awarded, streak, user.getCoins());
    }

    /** Verkoopt alle duplicates (alles boven 1 exemplaar) van de speler in één keer. Er blijft
     * altijd minstens 1 exemplaar van elke kaart over. */
    @Transactional
    public SellDuplicatesResponse sellDuplicates(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));

        List<UserCard> duplicates = userCardRepository.findDuplicatesByUserId(userId);
        long earned = 0;
        for (UserCard uc : duplicates) {
            int extra = uc.getQuantity() - 1;
            if (extra <= 0) continue;
            int valuePerCard = CardValuation.sellValueFor(uc.getCard().getRarity()) + CardValuation.DUPLICATE_BONUS;
            earned += (long) extra * valuePerCard;
            uc.setQuantity(1);
        }

        if (earned > 0) {
            user.setCoins(user.getCoins() + earned);
            transactionRepository.save(new Transaction(user, TransactionType.SELL, earned,
                    "Bulk sell duplicates (" + duplicates.size() + " kaarten)"));
            userStatsService.recordCoinsEarned(userId, earned);
        }

        return new SellDuplicatesResponse(earned, user.getCoins());
    }
}
