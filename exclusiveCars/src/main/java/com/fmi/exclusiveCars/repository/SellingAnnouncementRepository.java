package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.SellingAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SellingAnnouncementRepository extends JpaRepository<SellingAnnouncement, Long> {

}
