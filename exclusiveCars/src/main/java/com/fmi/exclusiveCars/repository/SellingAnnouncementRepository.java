package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.EState;
import com.fmi.exclusiveCars.model.SellingAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellingAnnouncementRepository extends JpaRepository<SellingAnnouncement, Long> {

    @Query("SELECT s FROM SellingAnnouncement s WHERE s.state = ?1")
    List<SellingAnnouncement> getSellingAnnouncementsByState(EState state);
}
