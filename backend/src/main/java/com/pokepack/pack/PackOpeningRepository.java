package com.pokepack.pack;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PackOpeningRepository extends JpaRepository<PackOpening, Long> {
    long countByUser_Id(Long userId);
}
