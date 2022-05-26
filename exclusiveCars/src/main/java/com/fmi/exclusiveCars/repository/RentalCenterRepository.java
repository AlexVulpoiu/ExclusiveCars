package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.RentalCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RentalCenterRepository extends JpaRepository<RentalCenter, Long> {
    Optional<RentalCenter> findById(Long id);
    Optional<RentalCenter> findByName(String name);
}
