package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.RentalAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalAnnouncementRepository extends JpaRepository<RentalAnnouncement, Long> {

    @Query("SELECT r FROM RentalAnnouncement r WHERE r.rentalCenter.id = ?1")
    List<RentalAnnouncement> getRentalAnnouncementFromRentalCenter(Long rentalCenterId);
}
