package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.services.SellingAnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sellingAnnouncements")
public class SellingAnnouncementController {

    private final SellingAnnouncementService sellingAnnouncementService;

    @Autowired
    public SellingAnnouncementController(SellingAnnouncementService sellingAnnouncementService) {
        this.sellingAnnouncementService = sellingAnnouncementService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSellingAnnouncement(@PathVariable Long id) {
        return sellingAnnouncementService.getSellingAnnouncement(id);
    }
}
