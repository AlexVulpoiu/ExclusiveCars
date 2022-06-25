package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.services.FavoriteSellingAnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/favoriteSellingAnnouncements")
public class FavoriteSellingAnnouncementController {

    private final FavoriteSellingAnnouncementService favoriteSellingAnnouncementService;

    @Autowired
    public FavoriteSellingAnnouncementController(FavoriteSellingAnnouncementService favoriteSellingAnnouncementService) {
        this.favoriteSellingAnnouncementService = favoriteSellingAnnouncementService;
    }

    @GetMapping("")
    public ResponseEntity<?> getFavoriteSellingAnnouncements() {
        return favoriteSellingAnnouncementService.getFavoriteSellingAnnouncements();
    }

    @PostMapping("/add/{id}")
    public ResponseEntity<?> addToFavorites(@PathVariable Long id) {
        return favoriteSellingAnnouncementService.addToFavorites(id);
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeFromFavorites(@PathVariable Long id) {
        return favoriteSellingAnnouncementService.removeFromFavorites(id);
    }
}
