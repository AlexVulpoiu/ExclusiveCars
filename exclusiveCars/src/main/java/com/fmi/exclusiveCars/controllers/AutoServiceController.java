package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.model.AutoService;
import com.fmi.exclusiveCars.repository.AutoServiceRepository;
import com.fmi.exclusiveCars.services.AutoServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/autoServices")
public class AutoServiceController {
    private final AutoServiceRepository autoServiceRepository;
    private final AutoServiceService autoServiceService;

    @Autowired
    public AutoServiceController(AutoServiceRepository autoServiceRepository, AutoServiceService autoServiceService) {
        this.autoServiceRepository = autoServiceRepository;
        this.autoServiceService = autoServiceService;
    }

    @GetMapping("")
    public ResponseEntity<List<AutoService>> getAutoServices() {
        return new ResponseEntity<>(autoServiceRepository.findAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAutoService(@PathVariable Long id) {
        return autoServiceService.getAutoService(id);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addAutoService(@RequestBody AutoService autoService) {
        return new ResponseEntity<>(autoServiceService.addAutoService(autoService), HttpStatus.OK);
    }

    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> editAutoService(@PathVariable Long id, @RequestBody AutoService autoService) {
        return autoServiceService.editAutoService(id, autoService);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteAutoService(@PathVariable Long id) {
        return autoServiceService.deleteAutoService(id);
    }
}
