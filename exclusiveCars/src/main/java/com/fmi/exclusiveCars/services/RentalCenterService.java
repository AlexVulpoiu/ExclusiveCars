package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.RentalCenter;
import com.fmi.exclusiveCars.repository.RentalCenterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RentalCenterService {
    private final RentalCenterRepository rentalCenterRepository;

    @Autowired
    public RentalCenterService(RentalCenterRepository rentalCenterRepository) {
        this.rentalCenterRepository = rentalCenterRepository;
    }

    public ResponseEntity<?> getRentalCenter(Long id) {
        Optional<RentalCenter> rentalCenter = rentalCenterRepository.findById(id);

        if(rentalCenter.isPresent()) {
            RentalCenter currentRentalCenter = rentalCenter.get();
            return new ResponseEntity<>(currentRentalCenter, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public Long addRentalCenter(RentalCenter rentalCenter) {
        rentalCenterRepository.save(rentalCenter);
        return rentalCenter.getId();
    }

    public ResponseEntity<?> editRentalCenter(Long id, RentalCenter rentalCenter) {
        Optional<RentalCenter> actualRentalCenter = rentalCenterRepository.findById(id);

        if(actualRentalCenter.isPresent()) {
            RentalCenter currentRentalCenter = actualRentalCenter.get();
            currentRentalCenter.setName(rentalCenter.getName());
            currentRentalCenter.setCity(rentalCenter.getCity());
            currentRentalCenter.setAddress(rentalCenter.getAddress());
            currentRentalCenter.setEmail(rentalCenter.getEmail());
            currentRentalCenter.setPhone(rentalCenter.getPhone());

            rentalCenterRepository.save(currentRentalCenter);
            return new ResponseEntity<>(currentRentalCenter, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<HttpStatus> deleteRentalCenter(Long id) {
        rentalCenterRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
