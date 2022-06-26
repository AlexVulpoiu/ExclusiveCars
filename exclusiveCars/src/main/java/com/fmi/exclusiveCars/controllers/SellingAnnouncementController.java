package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.SellingAnnouncementDto;
import com.fmi.exclusiveCars.model.EState;
import com.fmi.exclusiveCars.services.SellingAnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sellingAnnouncements")
public class SellingAnnouncementController {

    private final SellingAnnouncementService sellingAnnouncementService;

    @Autowired
    public SellingAnnouncementController(SellingAnnouncementService sellingAnnouncementService) {
        this.sellingAnnouncementService = sellingAnnouncementService;
    }

    @GetMapping("")
    public ResponseEntity<?> getSellingAnnouncements() {
        return sellingAnnouncementService.getSellingAnnouncements();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSellingAnnouncement(@PathVariable Long id) {
        return sellingAnnouncementService.getSellingAnnouncement(id);
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMySellingAnnouncements() {
        return sellingAnnouncementService.getMySellingAnnouncements();
    }

    @GetMapping("/filter")
    public ResponseEntity<?> getSellingAnnouncementsByCar(@RequestParam(required = false) String filter) {
        return sellingAnnouncementService.getSellingAnnouncementsByCar(filter);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getPendingSellingAnnouncements() {
        return sellingAnnouncementService.getPendingSellingAnnouncements();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addSellingAnnouncement(@Valid @RequestBody SellingAnnouncementDto sellingAnnouncementDto) {
        return sellingAnnouncementService.addSellingAnnouncement(sellingAnnouncementDto);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editSellingAnnouncement(@PathVariable Long id, @Valid @RequestBody SellingAnnouncementDto sellingAnnouncementDto) {
        return sellingAnnouncementService.editSellingAnnouncement(id, sellingAnnouncementDto);
    }

    @PutMapping("/changeState/{id}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> changeState(@PathVariable Long id, @RequestBody EState state) {
        return sellingAnnouncementService.changeState(id, state);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSellingAnnouncement(@PathVariable Long id) {
        return sellingAnnouncementService.deleteSellingAnnouncement(id);
    }
}
