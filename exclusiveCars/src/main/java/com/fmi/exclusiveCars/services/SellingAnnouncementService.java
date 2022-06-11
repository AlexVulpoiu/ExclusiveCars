package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.SellingAnnouncement;
import com.fmi.exclusiveCars.repository.SellingAnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SellingAnnouncementService {

    private final SellingAnnouncementRepository sellingAnnouncementRepository;

    @Autowired
    public SellingAnnouncementService(SellingAnnouncementRepository sellingAnnouncementRepository) {
        this.sellingAnnouncementRepository = sellingAnnouncementRepository;
    }

    public ResponseEntity<?> getSellingAnnouncement(Long id) {

        Optional<SellingAnnouncement> sellingAnnouncement = sellingAnnouncementRepository.findById(id);
        if(sellingAnnouncement.isEmpty()) {
            return new ResponseEntity<>("Acest anunț de vânzare nu există!", HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(sellingAnnouncement.get(), HttpStatus.OK);
    }
}
