package com.pokepack.binder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserCardRepository extends JpaRepository<UserCard, UserCardId> {

    @Query("select uc from UserCard uc where uc.user.id = :userId and uc.card.id = :cardId")
    Optional<UserCard> findByUserIdAndCardId(@Param("userId") Long userId, @Param("cardId") String cardId);

    @Query("select uc from UserCard uc where uc.user.id = :userId")
    List<UserCard> findAllByUserId(@Param("userId") Long userId);

    // join fetch zodat card + set veilig op te vragen zijn buiten de repository-transactie om
    // (spring.jpa.open-in-view staat uit) — zie ook PackTypeRepository#findActiveWithSet.
    @Query("select uc from UserCard uc join fetch uc.card c join fetch c.set where uc.user.id = :userId")
    List<UserCard> findAllByUserIdWithCardAndSet(@Param("userId") Long userId);

    @Query("select uc from UserCard uc where uc.user.id = :userId and uc.quantity > 1")
    List<UserCard> findDuplicatesByUserId(@Param("userId") Long userId);

    @Query("select count(uc) > 0 from UserCard uc where uc.user.id = :userId and lower(uc.card.rarity) not in ('common', 'uncommon')")
    boolean hasAnyHoloOrBetter(@Param("userId") Long userId);

    // Voor set-completion-checks: alleen de kaart-id + set-id nodig, geen volledige entiteiten.
    @Query("select uc.card.id as cardId, uc.card.set.id as setId from UserCard uc where uc.user.id = :userId")
    List<OwnedCardSetProjection> findOwnedCardSetPairs(@Param("userId") Long userId);

    interface OwnedCardSetProjection {
        String getCardId();
        String getSetId();
    }
}
