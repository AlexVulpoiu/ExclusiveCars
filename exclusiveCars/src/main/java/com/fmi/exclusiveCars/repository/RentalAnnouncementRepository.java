package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.EState;
import com.fmi.exclusiveCars.model.RentalAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentalAnnouncementRepository extends JpaRepository<RentalAnnouncement, Long> {

    @Query("SELECT r FROM RentalAnnouncement r WHERE r.rentalCenter.id = ?1")
    List<RentalAnnouncement> getRentalAnnouncementsFromRentalCenter(Long rentalCenterId);

    @Query("SELECT r FROM RentalAnnouncement r WHERE r.state = ?1")
    List<RentalAnnouncement> getRentalAnnouncementsByState(EState state);

    @Query("SELECT r FROM RentalAnnouncement r WHERE r.rentalCenter.id = ?1 AND r.state = ?2")
    List<RentalAnnouncement> getRentalAnnouncementsFromRentalCenterByState(Long rentalCenterId, EState state);

    @Query("SELECT r FROM RentalAnnouncement r WHERE r.car.id = ?1")
    Optional<RentalAnnouncement> findByCar(Long carId);
}
