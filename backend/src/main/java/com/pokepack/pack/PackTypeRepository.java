package com.pokepack.pack;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PackTypeRepository extends JpaRepository<PackType, Long> {

    // join fetch zodat pt.getSet() veilig op te vragen is nadat de repository-transactie al
    // gesloten is (spring.jpa.open-in-view staat uit) — zonder fetch zou dat een
    // LazyInitializationException geven.
    @Query("select pt from PackType pt join fetch pt.set where pt.active = true")
    List<PackType> findActiveWithSet();
}
