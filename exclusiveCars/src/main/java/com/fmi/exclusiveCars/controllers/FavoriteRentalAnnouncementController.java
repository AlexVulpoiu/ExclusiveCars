package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.services.FavoriteRentalAnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/favoriteRentalAnnouncements")
public class FavoriteRentalAnnouncementController {

    private final FavoriteRentalAnnouncementService favoriteRentalAnnouncementService;

    @Autowired
    public FavoriteRentalAnnouncementController(FavoriteRentalAnnouncementService favoriteRentalAnnouncementService) {
        this.favoriteRentalAnnouncementService = favoriteRentalAnnouncementService;
    }

    @GetMapping("")
    public ResponseEntity<?> getFavoriteRentalAnnouncements() {
        return favoriteRentalAnnouncementService.getFavoriteRentalAnnouncements();
    }

    @PostMapping("/add/{id}")
    public ResponseEntity<?> addToFavorites(@PathVariable Long id) {
        return favoriteRentalAnnouncementService.addToFavorites(id);
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeFromFavorites(@PathVariable Long id) {
        return favoriteRentalAnnouncementService.removeFromFavorites(id);
    }
}
