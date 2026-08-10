package com.pokepack.pack;

import com.pokepack.achievement.AchievementService;
import com.pokepack.achievement.dto.AchievementStatusDto;
import com.pokepack.binder.UserCardRepository;
import com.pokepack.card.Card;
import com.pokepack.card.CardRepository;
import com.pokepack.card.CardSet;
import com.pokepack.card.CardSetRepository;
import com.pokepack.pack.dto.PackOpenResponse;
import com.pokepack.pack.exception.InsufficientCoinsException;
import com.pokepack.pack.exception.PackLockedException;
import com.pokepack.quest.QuestService;
import com.pokepack.quest.dto.QuestStatusDto;
import com.pokepack.user.User;
import com.pokepack.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// @Transactional op een test-klasse rolt elke testmethode automatisch terug — zo kan dit
// zonder gedoe tegen de echte lokale Postgres draaien (Flyway-migraties uit database/migrations
// worden bij het opstarten van de context toegepast) zonder dat tests elkaars data raken.
@SpringBootTest
@Transactional
@DirtiesContext
class PackOpeningServiceIntegrationTest {

    @Autowired
    private PackOpeningService packOpeningService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CardSetRepository cardSetRepository;
    @Autowired
    private CardRepository cardRepository;
    @Autowired
    private PackTypeRepository packTypeRepository;
    @Autowired
    private UserCardRepository userCardRepository;
    @Autowired
    private QuestService questService;
    @Autowired
    private AchievementService achievementService;

    private User user;
    private PackType packType;
    private Card firstHitCard;

    @BeforeEach
    void seed() {
        CardSet set = cardSetRepository.save(new CardSet("test-set", "Test Set"));

        for (int i = 0; i < 10; i++) {
            cardRepository.save(new Card("test-set-common-" + i, set, "Common Mon " + i, String.valueOf(i), "Common"));
        }
        for (int i = 0; i < 5; i++) {
            cardRepository.save(new Card("test-set-uncommon-" + i, set, "Uncommon Mon " + i, String.valueOf(i + 10), "Uncommon"));
        }
        firstHitCard = cardRepository.save(new Card("test-set-hit-0", set, "Hit Mon", "99", "Rare Holo"));

        packType = packTypeRepository.save(new PackType(set, "Test Pack", 100, 1, 5, 2, 1, 1));

        user = userRepository.save(new User("Tester", "tester@example.com"));
        user.setCoins(500);
        userRepository.save(user);
    }

    @Test
    void openingAPackDeductsCoinsAndReturnsTheConfiguredNumberOfCards() {
        PackOpenResponse response = packOpeningService.openPack(user.getId(), packType.getId());

        assertThat(response.coinsSpent()).isEqualTo(100);
        assertThat(response.cards()).hasSize(9); // 5 commons + 2 uncommons + 1 reverse holo + 1 hit

        // De hits-pool in deze test heeft maar 1 kaart, dus die valt hier altijd en de
        // "first_holo"-achievement (+50) triggert dus altijd, deterministisch. Elke base-slot
        // (5 commons, 2 uncommons) trekt zelf al gegarandeerd unieke kaarten, dus zelfs in het
        // slechtste geval (reverse holo dupliceert een eerder getrokken slot) zijn er minstens
        // 8 nieuwe kaarten — ruim boven de 3/6-drempel van de twee "verzamel N nieuwe
        // kaarten"-dagelijkse quests, dus die vallen ook altijd. Samen met "open 1 pack" (ook
        // altijd waar) is dat +105 coins bovenop de +50 van first_holo, deterministisch. Of de
        // reverse-holo-trek toevallig dezelfde kaart pakt als een van de 2 losse
        // uncommon-slots (en dus als duplicate telt, +2) hangt af van de RNG — vandaar de
        // ondergrens/bovengrens i.p.v. een exacte waarde.
        long expectedMin = 500 - 100 + 50 + 105;
        long expectedMax = expectedMin + 2;
        assertThat(response.coinsBalance()).isBetween(expectedMin, expectedMax);
        assertThat(response.unlockedAchievementNames()).contains("Eerste holo");

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getCoins()).isEqualTo(response.coinsBalance());
    }

    @Test
    void theLastCardIsAlwaysFromTheHitPool() {
        PackOpenResponse response = packOpeningService.openPack(user.getId(), packType.getId());

        var lastCard = response.cards().get(response.cards().size() - 1);
        assertThat(lastCard.rarity()).isEqualTo("Rare Holo");
    }

    @Test
    void rejectsOpeningWithoutEnoughCoins() {
        user.setCoins(10);
        userRepository.save(user);

        assertThatThrownBy(() -> packOpeningService.openPack(user.getId(), packType.getId()))
                .isInstanceOf(InsufficientCoinsException.class);

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getCoins()).isEqualTo(10); // niets afgeschreven bij een mislukte poging
    }

    @Test
    void rejectsOpeningAPackAboveThePlayersLevel() {
        PackType premium = packTypeRepository.save(
                new PackType(packType.getSet(), "Premium Pack", 200, 5, 5, 2, 1, 1));

        assertThatThrownBy(() -> packOpeningService.openPack(user.getId(), premium.getId()))
                .isInstanceOf(PackLockedException.class);
    }

    @Test
    void pullingAnAlreadyOwnedCardIsFlaggedAsDuplicateAndPaysABonus() {
        // Zet de speler alvast in bezit van de enige hit-kaart in de pool, zodat de volgende
        // keer dat 'ie valt, het gegarandeerd een duplicate is.
        var userCard = new com.pokepack.binder.UserCard(user, firstHitCard, 1);
        userCardRepository.save(userCard);

        PackOpenResponse response = packOpeningService.openPack(user.getId(), packType.getId());

        var hitPull = response.cards().stream()
                .filter(c -> c.cardId().equals(firstHitCard.getId()))
                .findFirst()
                .orElseThrow();
        assertThat(hitPull.duplicate()).isTrue();

        var storedUserCard = userCardRepository.findByUserIdAndCardId(user.getId(), firstHitCard.getId()).orElseThrow();
        assertThat(storedUserCard.getQuantity()).isEqualTo(2);
    }

    @Test
    void completingASetAwardsTheSetCompletionBonus() {
        // Set met precies 1 common + 1 hit, en een pack die precies die 2 kaarten trekt — zo is
        // de set gegarandeerd (deterministisch, geen RNG-afhankelijkheid) compleet na 1 pack.
        CardSet tinySet = cardSetRepository.save(new CardSet("tiny-set", "Tiny Set"));
        cardRepository.save(new Card("tiny-common", tinySet, "Only Common", "1", "Common"));
        cardRepository.save(new Card("tiny-hit", tinySet, "Only Hit", "2", "Rare Holo"));
        PackType tinyPack = packTypeRepository.save(new PackType(tinySet, "Tiny Pack", 10, 1, 1, 0, 0, 1));

        PackOpenResponse response = packOpeningService.openPack(user.getId(), tinyPack.getId());

        assertThat(response.setCompletionBonusCoins()).isEqualTo(500);
    }

    @Test
    void notCompletingASetLeavesTheBonusNull() {
        PackOpenResponse response = packOpeningService.openPack(user.getId(), packType.getId());

        assertThat(response.setCompletionBonusCoins()).isNull();
    }

    @Test
    void openingThreePacksCompletesTheDailyQuest() {
        for (int i = 0; i < 3; i++) {
            packOpeningService.openPack(user.getId(), packType.getId());
        }

        QuestStatusDto daily = questService.listWithProgress(user.getId()).stream()
                .filter(q -> q.code().equals("daily_open_3_packs"))
                .findFirst()
                .orElseThrow();
        assertThat(daily.progress()).isEqualTo(3);
        assertThat(daily.completed()).isTrue();
    }

    @Test
    void openingAPackAwardsAtLeastTheBasePackOpenXp() {
        // Ondergrens i.p.v. exacte waarde: hoeveel extra XP erbovenop komt hangt af van hoeveel
        // van de 9 pulls nieuw zijn (RNG) en of de first_holo-achievement al triggert.
        PackOpenResponse response = packOpeningService.openPack(user.getId(), packType.getId());

        assertThat(response.xp()).isGreaterThanOrEqualTo(15);
        assertThat(response.playerLevel()).isGreaterThanOrEqualTo(1);

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getXp()).isEqualTo(response.xp());
        assertThat(reloaded.getLevel()).isEqualTo(response.playerLevel());
    }

    @Test
    void openingEnoughPacksReachesLevelFive() {
        // Elke pack-opening geeft minstens de vaste pack-open-XP (15), los van RNG (nieuwe
        // kaarten/quests/achievements geven extra XP bovenop). 50 packs * 15 = 750 XP, ruim
        // boven de 600 XP die nodig is voor level 5 — dus deterministisch, geen RNG-afhankelijkheid.
        user.setCoins(20_000);
        userRepository.save(user);

        PackOpenResponse last = null;
        for (int i = 0; i < 50; i++) {
            last = packOpeningService.openPack(user.getId(), packType.getId());
        }

        assertThat(last.playerLevel()).isGreaterThanOrEqualTo(5);
        assertThat(last.xp()).isGreaterThanOrEqualTo(600);

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getLevel()).isEqualTo(last.playerLevel());
        assertThat(reloaded.getXp()).isEqualTo(last.xp());
    }

    @Test
    void openingTenPacksUnlocksThePacksOpenedAchievement() {
        user.setCoins(10_000); // ruim genoeg voor 10 packs + eventuele duplicate-bonussen
        userRepository.save(user);

        for (int i = 0; i < 10; i++) {
            packOpeningService.openPack(user.getId(), packType.getId());
        }

        AchievementStatusDto tenPacks = achievementService.listWithStatus(user.getId()).stream()
                .filter(a -> a.code().equals("packs_opened_10"))
                .findFirst()
                .orElseThrow();
        assertThat(tenPacks.unlocked()).isTrue();
    }
}
