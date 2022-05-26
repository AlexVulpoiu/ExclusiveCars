package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.AutoService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AutoServiceRepository extends JpaRepository<AutoService, Long> {
    Optional<AutoService> findById(Long id);
}
