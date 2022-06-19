package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.RentalCenterDto;
import com.fmi.exclusiveCars.services.RentalCenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/rentalCenters")
public class RentalCenterController {
    private final RentalCenterService rentalCenterService;

    @Autowired
    public RentalCenterController(RentalCenterService rentalCenterService) {
        this.rentalCenterService = rentalCenterService;
    }

    @GetMapping("")
    public ResponseEntity<?> getRentalCenters() {
        return rentalCenterService.getAllRentalCenters();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRentalCenter(@PathVariable Long id) {
        return rentalCenterService.getRentalCenter(id);
    }

    @GetMapping("/filter")
    public ResponseEntity<?> getRentalCentersByNameOrLocation(@RequestParam(required = false) String filter) {
        return rentalCenterService.getRentalCentersByNameOrLocation(filter);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ORGANISATION')")
    public ResponseEntity<?> addRentalCenter(@Valid @RequestBody RentalCenterDto rentalCenterDto) {
        return rentalCenterService.addRentalCenter(rentalCenterDto);
    }

    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('ORGANISATION')")
    public ResponseEntity<?> editRentalCenter(@PathVariable Long id, @Valid @RequestBody RentalCenterDto rentalCenterDto) {
        return rentalCenterService.editRentalCenter(id, rentalCenterDto);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteRentalCenter(@PathVariable Long id) {
        return rentalCenterService.deleteRentalCenter(id);
    }
}
