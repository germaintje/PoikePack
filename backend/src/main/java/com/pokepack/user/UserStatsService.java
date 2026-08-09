package com.pokepack.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Enige plek die user_stats muteert. getOrCreate is bewust zelfherstellend (i.p.v. ervan uit te
 * gaan dat de rij al bestaat) zodat dit ook klopt voor users die van vóór deze tabel dateren.
 */
@Service
public class UserStatsService {

    private final UserStatsRepository userStatsRepository;
    private final UserRepository userRepository;

    public UserStatsService(UserStatsRepository userStatsRepository, UserRepository userRepository) {
        this.userStatsRepository = userStatsRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void recordPackOpened(Long userId) {
        getOrCreate(userId).addPackOpened();
    }

    @Transactional
    public void recordCoinsEarned(Long userId, long amount) {
        if (amount <= 0) return;
        getOrCreate(userId).addCoinsEarned(amount);
    }

    @Transactional
    public void recordCoinsSpent(Long userId, long amount) {
        if (amount <= 0) return;
        getOrCreate(userId).addCoinsSpent(amount);
    }

    @Transactional
    public void recordCardCollected(Long userId) {
        getOrCreate(userId).addCardCollected();
    }

    @Transactional
    public UserStats getOrCreateStats(Long userId) {
        return getOrCreate(userId);
    }

    private UserStats getOrCreate(Long userId) {
        return userStatsRepository.findById(userId).orElseGet(() -> {
            User reference = userRepository.getReferenceById(userId);
            return userStatsRepository.save(new UserStats(reference));
        });
    }
}
