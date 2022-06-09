package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.AutoServiceDto;
import com.fmi.exclusiveCars.services.AutoServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/autoServices")
public class AutoServiceController {
    private final AutoServiceService autoServiceService;

    @Autowired
    public AutoServiceController(AutoServiceService autoServiceService) {
        this.autoServiceService = autoServiceService;
    }

    @GetMapping("")
    public ResponseEntity<?> getAllAutoServices() {
        return autoServiceService.getAllAutoServices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAutoService(@PathVariable Long id) {
        return autoServiceService.getAutoService(id);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ORGANISATION')")
    public ResponseEntity<?> addAutoService(@Valid @RequestBody AutoServiceDto autoServiceDto) {
        return autoServiceService.addAutoService(autoServiceDto);
    }

    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('ORGANISATION')")
    public ResponseEntity<?> editAutoService(@PathVariable Long id, @Valid @RequestBody AutoServiceDto autoServiceDto) {
        return autoServiceService.editAutoService(id, autoServiceDto);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteAutoService(@PathVariable Long id) {
        return autoServiceService.deleteAutoService(id);
    }
}
