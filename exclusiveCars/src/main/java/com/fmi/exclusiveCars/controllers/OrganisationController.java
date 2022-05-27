package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.OrganisationDto;
import com.fmi.exclusiveCars.services.OrganisationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/organisations")
public class OrganisationController {

    private final OrganisationService organisationService;

    @Autowired
    public OrganisationController(OrganisationService organisationService) {
        this.organisationService = organisationService;
    }

    @GetMapping("")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrganisations() {
        return organisationService.getAllOrganisations();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getOrganisation(@PathVariable Long id) {
        return organisationService.getOrganisation(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addOrganisation(@Valid @RequestBody OrganisationDto organisationDto) {
        return organisationService.addOrganisation(organisationDto);
    }

    @PutMapping("/edit")
    @PreAuthorize("hasRole('ORGANISATION')")
    public ResponseEntity<?> editOrganisation(@Valid @RequestBody OrganisationDto organisationDto) {
        return organisationService.editOrganisation(organisationDto);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteOrganisation(@PathVariable Long id) {
        return organisationService.deleteOrganisation(id);
    }
}
