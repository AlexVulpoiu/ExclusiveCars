package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.services.RentCarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import java.io.UnsupportedEncodingException;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/rentCars")
public class RentCarController {

    private final RentCarService rentCarService;

    @Autowired
    public RentCarController(RentCarService rentCarService) {
        this.rentCarService = rentCarService;
    }

    @GetMapping("/rentals/{id}")
    public ResponseEntity<?> getRentalsForCar(@PathVariable Long id) {
        return rentCarService.getRentalsForCar(id);
    }

    @GetMapping("/myRentals")
    public ResponseEntity<?> getMyRentals() {
        return rentCarService.getMyRentals();
    }

    @GetMapping("/myRentalRequests")
    public ResponseEntity<?> getMyRentalRequests() {
        return rentCarService.getMyRentalRequests();
    }

    @PostMapping("/rent/{carId}")
    public ResponseEntity<?> rentCar(@PathVariable Long carId, @RequestParam("startDate") String startDate,
                                     @RequestParam("endDate") String endDate, @RequestParam("announcement") Long announcementId) throws MessagingException, UnsupportedEncodingException {
        return rentCarService.rentCar(carId, startDate, endDate, announcementId);
    }

    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<?> cancelRentCar(@PathVariable String id) {
        return rentCarService.cancelRentCar(id);
    }
}
