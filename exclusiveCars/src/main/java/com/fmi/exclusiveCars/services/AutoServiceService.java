package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.AutoServiceDto;
import com.fmi.exclusiveCars.model.AutoService;
import com.fmi.exclusiveCars.repository.AutoServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class AutoServiceService {
    private final AutoServiceRepository autoServiceRepository;

    @Autowired
    public AutoServiceService(AutoServiceRepository autoServiceRepository) {
        this.autoServiceRepository = autoServiceRepository;
    }

    public ResponseEntity<?> getAllAutoServices() {
        Collection<AutoService> autoServices = autoServiceRepository.findAll();
        if(autoServices.isEmpty()) {
            return new ResponseEntity<>("There are no services listed yet!", HttpStatus.OK);
        }

        List<AutoService> autoServiceList = new ArrayList<>(autoServices);
        return new ResponseEntity<>(autoServiceList, HttpStatus.OK);
    }

    public ResponseEntity<?> getAutoService(Long id) {
        Optional<AutoService> autoService = autoServiceRepository.findById(id);

        if(autoService.isPresent()) {
            AutoService currentAutoService = autoService.get();
            return new ResponseEntity<>(currentAutoService, HttpStatus.OK);
        }

        return new ResponseEntity<>("The service you asked for doesn't exist!", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> addAutoService(AutoServiceDto autoServiceDto) {
        Optional<AutoService> autoServiceByName = autoServiceRepository.findByName(autoServiceDto.getName());
        Optional<AutoService> autoServiceByEmail = autoServiceRepository.findByEmail(autoServiceDto.getEmail());
        Optional<AutoService> autoServiceByPhone = autoServiceRepository.findByPhone(autoServiceDto.getPhone());
        if(autoServiceByName.isPresent() || autoServiceByEmail.isPresent() || autoServiceByPhone.isPresent()) {
            return new ResponseEntity<>("There is already an auto service with this information!", HttpStatus.BAD_REQUEST);
        }

        AutoService autoServiceToAdd = AutoService.builder()
                .name(autoServiceDto.getName())
                .city(autoServiceDto.getCity())
                .address(autoServiceDto.getAddress())
                .numberOfStations(autoServiceDto.getNumberOfStations())
                .email(autoServiceDto.getEmail())
                .phone(autoServiceDto.getPhone())
                .build();
        autoServiceRepository.save(autoServiceToAdd);

        return new ResponseEntity<>("The auto service was added successfully!", HttpStatus.OK);
    }

    public ResponseEntity<?> editAutoService(Long id, AutoServiceDto autoServiceDto) {
        Optional<AutoService> actualAutoService = autoServiceRepository.findById(id);

        Optional<AutoService> autoServiceByName = autoServiceRepository.findByName(autoServiceDto.getName());
        Optional<AutoService> autoServiceByEmail = autoServiceRepository.findByEmail(autoServiceDto.getEmail());
        Optional<AutoService> autoServiceByPhone = autoServiceRepository.findByPhone(autoServiceDto.getPhone());

        if(actualAutoService.isPresent()) {
            if((autoServiceByName.isPresent() && autoServiceByName.get() != actualAutoService.get())
                    || (autoServiceByEmail.isPresent() && autoServiceByEmail.get() != actualAutoService.get())
                    || (autoServiceByPhone.isPresent() && autoServiceByPhone.get() != actualAutoService.get())) {
                return new ResponseEntity<>("There is already an auto service with this information!", HttpStatus.BAD_REQUEST);
            }

            AutoService currentAutoService = actualAutoService.get();

            currentAutoService.setName(autoServiceDto.getName());
            currentAutoService.setCity(autoServiceDto.getCity());
            currentAutoService.setAddress(autoServiceDto.getAddress());
            currentAutoService.setNumberOfStations(autoServiceDto.getNumberOfStations());
            currentAutoService.setEmail(autoServiceDto.getEmail());
            currentAutoService.setPhone(autoServiceDto.getPhone());

            autoServiceRepository.save(currentAutoService);
            return new ResponseEntity<>("The auto service was successfully edited!", HttpStatus.OK);
        }

        return new ResponseEntity<>("The auto service you requested to edit doesn't exist!", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> deleteAutoService(Long id) {
        Optional<AutoService> autoService = autoServiceRepository.findById(id);

        if(autoService.isEmpty()) {
            return new ResponseEntity<>("The auto service you requested to delete doesn't exist!", HttpStatus.NOT_FOUND);
        }
        autoServiceRepository.deleteById(id);
        return new ResponseEntity<>("The auto service was successfully deleted!", HttpStatus.OK);
    }
}
