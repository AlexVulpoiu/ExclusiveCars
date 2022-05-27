package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.Organisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganisationRepository extends JpaRepository<Organisation, Long> {

    Optional<Organisation> findById(Long id);
    Optional<Organisation> findByName(String name);
}
