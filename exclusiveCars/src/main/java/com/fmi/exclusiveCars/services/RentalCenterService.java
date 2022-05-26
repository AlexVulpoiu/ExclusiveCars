package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.RentalCenterDto;
import com.fmi.exclusiveCars.model.RentalCenter;
import com.fmi.exclusiveCars.repository.RentalCenterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class RentalCenterService {
    private final RentalCenterRepository rentalCenterRepository;

    @Autowired
    public RentalCenterService(RentalCenterRepository rentalCenterRepository) {
        this.rentalCenterRepository = rentalCenterRepository;
    }

    public ResponseEntity<?> getAllRentalCenters() {
        Collection<RentalCenter> rentalCenters = rentalCenterRepository.findAll();
        if(rentalCenters.isEmpty()) {
            return new ResponseEntity<>("There are no rental centers listed yet!", HttpStatus.OK);
        }

        List<RentalCenter> rentalCenterList = new ArrayList<>(rentalCenters);
        return new ResponseEntity<>(rentalCenterList, HttpStatus.OK);
    }

    public ResponseEntity<?> getRentalCenter(Long id) {
        Optional<RentalCenter> rentalCenter = rentalCenterRepository.findById(id);

        if(rentalCenter.isPresent()) {
            RentalCenter currentRentalCenter = rentalCenter.get();
            return new ResponseEntity<>(currentRentalCenter, HttpStatus.OK);
        }

        return new ResponseEntity<>("The rental center you asked for doesn't exist!", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> addRentalCenter(RentalCenterDto rentalCenterDto) {
        Optional<RentalCenter> rentalCenterByName = rentalCenterRepository.findByName(rentalCenterDto.getName());
        Optional<RentalCenter> rentalCenterByEmail = rentalCenterRepository.findByEmail(rentalCenterDto.getEmail());
        Optional<RentalCenter> rentalCenterByPhone = rentalCenterRepository.findByPhone(rentalCenterDto.getPhone());
        if(rentalCenterByName.isPresent() || rentalCenterByEmail.isPresent() || rentalCenterByPhone.isPresent()) {
            return new ResponseEntity<>("There is already a rental center with this information!", HttpStatus.BAD_REQUEST);
        }

        RentalCenter rentalCenterToAdd = RentalCenter.builder()
                .name(rentalCenterDto.getName())
                .city(rentalCenterDto.getCity())
                .address(rentalCenterDto.getAddress())
                .email(rentalCenterDto.getEmail())
                .phone(rentalCenterDto.getPhone())
                .build();
        rentalCenterRepository.save(rentalCenterToAdd);

        return new ResponseEntity<>("The rental center was successfully added!", HttpStatus.OK);
    }

    public ResponseEntity<?> editRentalCenter(Long id, RentalCenterDto rentalCenterDto) {
        Optional<RentalCenter> actualRentalCenter = rentalCenterRepository.findById(id);

        Optional<RentalCenter> rentalCenterByName = rentalCenterRepository.findByName(rentalCenterDto.getName());
        Optional<RentalCenter> rentalCenterByEmail = rentalCenterRepository.findByEmail(rentalCenterDto.getEmail());
        Optional<RentalCenter> rentalCenterByPhone = rentalCenterRepository.findByPhone(rentalCenterDto.getPhone());

        if(actualRentalCenter.isPresent()) {
            if((rentalCenterByName.isPresent() && rentalCenterByName.get() != actualRentalCenter.get())
                    || (rentalCenterByEmail.isPresent() && rentalCenterByEmail.get() != actualRentalCenter.get())
                    || (rentalCenterByPhone.isPresent() && rentalCenterByPhone.get() != actualRentalCenter.get())) {
                return new ResponseEntity<>("There is already a rental center with this information!", HttpStatus.BAD_REQUEST);
            }

            RentalCenter currentRentalCenter = actualRentalCenter.get();
            currentRentalCenter.setName(rentalCenterDto.getName());
            currentRentalCenter.setCity(rentalCenterDto.getCity());
            currentRentalCenter.setAddress(rentalCenterDto.getAddress());
            currentRentalCenter.setEmail(rentalCenterDto.getEmail());
            currentRentalCenter.setPhone(rentalCenterDto.getPhone());

            rentalCenterRepository.save(currentRentalCenter);
            return new ResponseEntity<>("The rental center was successfully edited!", HttpStatus.OK);
        }

        return new ResponseEntity<>("The rental center you have requested to edit doesn't exist!", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> deleteRentalCenter(Long id) {
        Optional<RentalCenter> rentalCenter = rentalCenterRepository.findById(id);

        if(rentalCenter.isEmpty()) {
            return new ResponseEntity<>("The rental center you requested to delete doesn't exist!", HttpStatus.NOT_FOUND);
        }
        rentalCenterRepository.deleteById(id);
        return new ResponseEntity<>("The rental center was successfully deleted!", HttpStatus.OK);
    }
}
