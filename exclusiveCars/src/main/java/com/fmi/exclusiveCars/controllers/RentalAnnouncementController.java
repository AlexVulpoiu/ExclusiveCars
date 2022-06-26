package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.CarDto;
import com.fmi.exclusiveCars.model.EState;
import com.fmi.exclusiveCars.services.RentalAnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
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

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getPendingRentalAnnouncements() {
        return rentalAnnouncementService.getPendingRentalAnnouncements();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRentalAnnouncement(@PathVariable Long id) {
        return rentalAnnouncementService.getRentalAnnouncement(id);
    }

    @GetMapping("/filter/{id}")
    public ResponseEntity<?> getRentalAnnouncementsByCar(@RequestParam(required = false) String filter, @PathVariable Long id) {
        return rentalAnnouncementService.getRentalAnnouncementsByCar(filter, id);
    }

    @GetMapping("/fromRentalCenter/{rentalCenterId}")
    public ResponseEntity<?> getRentalAnnouncementsFromRentalCenter(@PathVariable Long rentalCenterId) {
        return rentalAnnouncementService.getRentalAnnouncementsFromRentalCenter(rentalCenterId);
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyRentalAnnouncements() {
        return rentalAnnouncementService.getMyRentalAnnouncements();
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

    @PutMapping("/changeState/{id}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> changeState(@PathVariable Long id, @RequestBody EState state) {
        return rentalAnnouncementService.changeState(id, state);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteRentalAnnouncement(@PathVariable Long id) {
        return rentalAnnouncementService.deleteRentalAnnouncement(id);
    }
}
