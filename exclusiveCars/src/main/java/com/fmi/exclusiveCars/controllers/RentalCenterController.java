package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.model.RentalCenter;
import com.fmi.exclusiveCars.repository.RentalCenterRepository;
import com.fmi.exclusiveCars.services.RentalCenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentalCenters")
public class RentalCenterController {
    private final RentalCenterRepository rentalCenterRepository;
    private final RentalCenterService rentalCenterService;

    @Autowired
    public RentalCenterController(RentalCenterRepository rentalCenterRepository, RentalCenterService rentalCenterService) {
        this.rentalCenterRepository = rentalCenterRepository;
        this.rentalCenterService = rentalCenterService;
    }

    @GetMapping("")
    public ResponseEntity<List<RentalCenter>> getRentalCenters() {
        return new ResponseEntity<>(rentalCenterRepository.findAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRentalCenter(@PathVariable Long id) {
        return rentalCenterService.getRentalCenter(id);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addRentalCenter(@RequestBody RentalCenter rentalCenter) {
        return new ResponseEntity<>(rentalCenterService.addRentalCenter(rentalCenter), HttpStatus.OK);
    }

    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> editRentalCenter(@PathVariable Long id, @RequestBody RentalCenter rentalCenter) {
        return rentalCenterService.editRentalCenter(id, rentalCenter);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteRentalCenter(@PathVariable Long id) {
        return rentalCenterService.deleteRentalCenter(id);
    }
}
