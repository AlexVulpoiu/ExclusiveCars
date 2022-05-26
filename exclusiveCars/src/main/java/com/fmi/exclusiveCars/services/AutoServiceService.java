package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.AutoService;
import com.fmi.exclusiveCars.repository.AutoServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AutoServiceService {
    private final AutoServiceRepository autoServiceRepository;

    @Autowired
    public AutoServiceService(AutoServiceRepository autoServiceRepository) {
        this.autoServiceRepository = autoServiceRepository;
    }

    public ResponseEntity<?> getAutoService(Long id) {
        Optional<AutoService> autoService = autoServiceRepository.findById(id);

        if(autoService.isPresent()) {
            AutoService currentAutoService = autoService.get();
            return new ResponseEntity<>(currentAutoService, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public Long addAutoService(AutoService autoService) {
        autoServiceRepository.save(autoService);
        return autoService.getId();
    }

    public ResponseEntity<?> editAutoService(Long id, AutoService autoService) {
        Optional<AutoService> actualAutoService = autoServiceRepository.findById(id);

        if(actualAutoService.isPresent()) {
            AutoService currentAutoService = actualAutoService.get();

            currentAutoService.setName(autoService.getName());
            currentAutoService.setCity(autoService.getCity());
            currentAutoService.setAddress(autoService.getAddress());
            currentAutoService.setNumberOfStations(autoService.getNumberOfStations());
            currentAutoService.setEmail(autoService.getEmail());
            currentAutoService.setPhone(autoService.getPhone());

            autoServiceRepository.save(currentAutoService);
            return new ResponseEntity<>(currentAutoService, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<HttpStatus> deleteAutoService(Long id) {
        autoServiceRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
