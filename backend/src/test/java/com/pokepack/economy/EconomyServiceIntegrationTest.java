package com.pokepack.economy;

import com.pokepack.binder.UserCard;
import com.pokepack.binder.UserCardRepository;
import com.pokepack.card.Card;
import com.pokepack.card.CardRepository;
import com.pokepack.card.CardSet;
import com.pokepack.card.CardSetRepository;
import com.pokepack.economy.dto.DailyBonusResponse;
import com.pokepack.economy.dto.SellDuplicatesResponse;
import com.pokepack.economy.exception.DailyBonusAlreadyClaimedException;
import com.pokepack.user.User;
import com.pokepack.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
@DirtiesContext
class EconomyServiceIntegrationTest {

    @Autowired
    private EconomyService economyService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CardSetRepository cardSetRepository;
    @Autowired
    private CardRepository cardRepository;
    @Autowired
    private UserCardRepository userCardRepository;

    private User user;

    @BeforeEach
    void seed() {
        user = userRepository.save(new User("Tester", "tester-economy@example.com"));
        user.setCoins(0);
        userRepository.save(user);
    }

    @Test
    void firstDailyBonusStartsAOneDayStreak() {
        DailyBonusResponse response = economyService.claimDailyBonus(user.getId());

        assertThat(response.streak()).isEqualTo(1);
        assertThat(response.coinsAwarded()).isEqualTo(25); // basisbonus, geen streak-toeslag op dag 1
    }

    @Test
    void claimingTwiceOnTheSameDayIsRejected() {
        economyService.claimDailyBonus(user.getId());

        assertThatThrownBy(() -> economyService.claimDailyBonus(user.getId()))
                .isInstanceOf(DailyBonusAlreadyClaimedException.class);
    }

    @Test
    void claimingOnConsecutiveDaysExtendsTheStreakAndIncreasesTheBonus() {
        user.setLastDailyBonusDate(LocalDate.now().minusDays(1));
        user.setDailyStreak(3);
        userRepository.save(user);

        DailyBonusResponse response = economyService.claimDailyBonus(user.getId());

        assertThat(response.streak()).isEqualTo(4);
        assertThat(response.coinsAwarded()).isEqualTo(25 + 3 * 5); // dag 4: 3 streak-dagen bonus
    }

    @Test
    void aGapResetsTheStreakToOne() {
        user.setLastDailyBonusDate(LocalDate.now().minusDays(3));
        user.setDailyStreak(6);
        userRepository.save(user);

        DailyBonusResponse response = economyService.claimDailyBonus(user.getId());

        assertThat(response.streak()).isEqualTo(1);
    }

    @Test
    void sellingDuplicatesKeepsOneCopyAndPaysForTheRest() {
        CardSet set = cardSetRepository.save(new CardSet("econ-set", "Econ Set"));
        Card card = cardRepository.save(new Card("econ-card-1", set, "Duped Mon", "1", "Common"));
        userCardRepository.save(new UserCard(user, card, 4)); // 1 origineel + 3 duplicates

        SellDuplicatesResponse response = economyService.sellDuplicates(user.getId());

        // Common sell value (5) + duplicate bonus (2) = 7 per duplicate, x3 duplicates = 21
        assertThat(response.coinsEarned()).isEqualTo(21);
        assertThat(response.coinsBalance()).isEqualTo(21);

        var remaining = userCardRepository.findByUserIdAndCardId(user.getId(), card.getId()).orElseThrow();
        assertThat(remaining.getQuantity()).isEqualTo(1); // laatste exemplaar blijft altijd staan
    }

    @Test
    void sellingWithNoDuplicatesEarnsNothing() {
        SellDuplicatesResponse response = economyService.sellDuplicates(user.getId());

        assertThat(response.coinsEarned()).isEqualTo(0);
    }
}
