package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.CarDto;
import com.fmi.exclusiveCars.services.RentalAnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/rentalAnnouncements")
public class RentalAnnouncementController {

    private final RentalAnnouncementService rentalAnnouncementService;

    @Autowired
    public RentalAnnouncementController(RentalAnnouncementService rentalAnnouncementService) {
        this.rentalAnnouncementService = rentalAnnouncementService;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllRentalAnnouncements() {
        return rentalAnnouncementService.getAllRentalAnnouncements();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRentalAnnouncement(@PathVariable Long id) {
        return rentalAnnouncementService.getRentalAnnouncement(id);
    }

    @GetMapping("/fromRentalCenter/{rentalCenterId}")
    public ResponseEntity<?> getRentalAnnouncementsFromRentalCenter(@PathVariable Long rentalCenterId) {
        return rentalAnnouncementService.getRentalAnnouncementsFromRentalCenter(rentalCenterId);
    }

    @PostMapping("/add/{rentalCenterId}")
    @PreAuthorize("hasRole('ORGANISATION')")
    public ResponseEntity<?> addRentalAnnouncement(@PathVariable Long rentalCenterId, @Valid @RequestBody CarDto carDto) {
        return rentalAnnouncementService.addRentalAnnouncement(rentalCenterId, carDto);
    }

    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('ORGANISATION')")
    public ResponseEntity<?> editRentalAnnouncement(@PathVariable Long id, @Valid @RequestBody CarDto carDto) {
        return rentalAnnouncementService.editRentalAnnouncement(id, carDto);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteRentalAnnouncement(@PathVariable Long id) {
        return rentalAnnouncementService.deleteRentalAnnouncement(id);
    }
}
