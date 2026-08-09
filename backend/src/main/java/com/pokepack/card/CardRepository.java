package com.pokepack.card;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, String> {

    @Query("select c from Card c where c.set.id = :setId and lower(c.rarity) = 'common'")
    List<Card> findCommons(@Param("setId") String setId);

    @Query("select c from Card c where c.set.id = :setId and lower(c.rarity) = 'uncommon'")
    List<Card> findUncommons(@Param("setId") String setId);

    // "Hit"-tier = alles wat geen common/uncommon is (rare, holo, ultra, secret, ...) — zelfde
    // indeling als frontend/src/lib/rarity.ts, bewust vrije rarity-strings i.p.v. een vaste enum.
    @Query("select c from Card c where c.set.id = :setId and lower(c.rarity) not in ('common', 'uncommon')")
    List<Card> findHits(@Param("setId") String setId);

    // join fetch zodat c.getSet().getName() veilig op te vragen is buiten de repository-
    // transactie om (spring.jpa.open-in-view staat uit).
    @Query("select c from Card c join fetch c.set where c.set.id = :setId order by c.number")
    List<Card> findBySetIdWithSet(@Param("setId") String setId);

    @Query("select c.id from Card c where c.set.id = :setId")
    List<String> findCardIdsBySetId(@Param("setId") String setId);

    long countBySetId(String setId);
}
