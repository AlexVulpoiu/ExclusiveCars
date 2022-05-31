package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.CarDto;
import com.fmi.exclusiveCars.dto.RentalAnnouncementDto;
import com.fmi.exclusiveCars.model.*;
import com.fmi.exclusiveCars.repository.RentalAnnouncementRepository;
import com.fmi.exclusiveCars.repository.RentalCenterRepository;
import com.fmi.exclusiveCars.repository.UserRepository;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RentalAnnouncementService {

    private final RentalAnnouncementRepository rentalAnnouncementRepository;

    private final RentalCenterRepository rentalCenterRepository;

    private final UserRepository userRepository;

    private final CarService carService;

    @Autowired
    public RentalAnnouncementService(RentalAnnouncementRepository rentalAnnouncementRepository, RentalCenterRepository rentalCenterRepository, UserRepository userRepository, CarService carService) {
        this.rentalAnnouncementRepository = rentalAnnouncementRepository;
        this.rentalCenterRepository = rentalCenterRepository;
        this.userRepository = userRepository;
        this.carService = carService;
    }

    public ResponseEntity<?> getAllRentalAnnouncements() {

        List<RentalAnnouncement> rentalAnnouncements = rentalAnnouncementRepository.findAll();
        if(rentalAnnouncements.isEmpty()) {
            return new ResponseEntity<>("There is no rental announcement posted yet!", HttpStatus.OK);
        }

        List<RentalAnnouncementDto> rentalAnnouncementDtoList = new ArrayList<>();

        for(RentalAnnouncement currentRentalAnnouncement: rentalAnnouncements) {
            RentalAnnouncementDto rentalAnnouncementDto = RentalAnnouncementDto.builder()
                    .id(currentRentalAnnouncement.getId())
                    .carId(currentRentalAnnouncement.getCar().getId())
                    .carManufacturer(currentRentalAnnouncement.getCar().getModel().getManufacturer())
                    .carModel(currentRentalAnnouncement.getCar().getModel().getModel())
                    .carCategory(currentRentalAnnouncement.getCar().getModel().getCategory())
                    .price(currentRentalAnnouncement.getCar().getPrice())
                    .carRating(currentRentalAnnouncement.getCar().getRating())
                    .build();
            rentalAnnouncementDtoList.add(rentalAnnouncementDto);
        }

        return new ResponseEntity<>(rentalAnnouncementDtoList, HttpStatus.OK);
    }

    public ResponseEntity<?> getRentalAnnouncement(Long id) {

        Optional<RentalAnnouncement> rentalAnnouncement = rentalAnnouncementRepository.findById(id);
        if(rentalAnnouncement.isEmpty()) {
            return new ResponseEntity<>("The rental announcement you requested doesn't exist!", HttpStatus.NOT_FOUND);
        }
        RentalAnnouncement currentRentalAnnouncement = rentalAnnouncement.get();
        RentalAnnouncementDto rentalAnnouncementDto = RentalAnnouncementDto.builder()
                .id(currentRentalAnnouncement.getId())
                .carId(currentRentalAnnouncement.getCar().getId())
                .carManufacturer(currentRentalAnnouncement.getCar().getModel().getManufacturer())
                .carModel(currentRentalAnnouncement.getCar().getModel().getModel())
                .carCategory(currentRentalAnnouncement.getCar().getModel().getCategory())
                .price(currentRentalAnnouncement.getCar().getPrice())
                .carRating(currentRentalAnnouncement.getCar().getRating())
                .build();

        return new ResponseEntity<>(rentalAnnouncementDto, HttpStatus.OK);
    }


    public ResponseEntity<?> getRentalAnnouncementsFromRentalCenter(Long rentalCenterId) {

        List<RentalAnnouncement> rentalAnnouncements = 
                rentalAnnouncementRepository.getRentalAnnouncementFromRentalCenter(rentalCenterId);
        if(rentalAnnouncements.isEmpty()) {
            return new ResponseEntity<>("There are no rental announcements posted by this rental center!", HttpStatus.OK);
        }

        List<RentalAnnouncementDto> rentalAnnouncementDtoList = new ArrayList<>();

        for(RentalAnnouncement currentRentalAnnouncement: rentalAnnouncements) {
            RentalAnnouncementDto rentalAnnouncementDto = RentalAnnouncementDto.builder()
                    .id(currentRentalAnnouncement.getId())
                    .carId(currentRentalAnnouncement.getCar().getId())
                    .carManufacturer(currentRentalAnnouncement.getCar().getModel().getManufacturer())
                    .carModel(currentRentalAnnouncement.getCar().getModel().getModel())
                    .carCategory(currentRentalAnnouncement.getCar().getModel().getCategory())
                    .price(currentRentalAnnouncement.getCar().getPrice())
                    .carRating(currentRentalAnnouncement.getCar().getRating())
                    .build();
            rentalAnnouncementDtoList.add(rentalAnnouncementDto);
        }
        
        return new ResponseEntity<>(rentalAnnouncementDtoList, HttpStatus.OK);
    }

    public ResponseEntity<?> addRentalAnnouncement(Long rentalCenterId, CarDto carDto) {

        Optional<RentalCenter> rentalCenter = rentalCenterRepository.findById(rentalCenterId);
        if(rentalCenter.isEmpty()) {
            return new ResponseEntity<>("The rental center doesn't exist!", HttpStatus.NOT_FOUND);
        }

        RentalCenter currentRentalCenter = rentalCenter.get();

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(!currentRentalCenter.getOrganisation().getOwner().equals(currentUser)) {
                return new ResponseEntity<>("You are not allowed to perform this operation!", HttpStatus.FORBIDDEN);
            }

            Car car = carService.addCar(carDto);
            RentalAnnouncement rentalAnnouncement = RentalAnnouncement.builder()
                    .car(car)
                    .rentalCenter(currentRentalCenter)
                    .build();
            rentalAnnouncementRepository.save(rentalAnnouncement);

            currentRentalCenter.getRentalAnnouncements().add(rentalAnnouncement);
            rentalCenterRepository.save(currentRentalCenter);

            return new ResponseEntity<>("Rental announcement successfully added!", HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> editRentalAnnouncement(Long id, CarDto carDto) {

        Optional<RentalAnnouncement> rentalAnnouncement = rentalAnnouncementRepository.findById(id);
        if(rentalAnnouncement.isEmpty()) {
            return new ResponseEntity<>("The rental announcement doesn't exist!", HttpStatus.NOT_FOUND);
        }

        RentalAnnouncement currentRentalAnnouncement = rentalAnnouncement.get();

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(!currentRentalAnnouncement.getRentalCenter().getOrganisation().getOwner().equals(currentUser)) {
                return new ResponseEntity<>("You are not allowed to perform this operation!", HttpStatus.FORBIDDEN);
            }

            Long carId = currentRentalAnnouncement.getCar().getId();
            carService.editCar(carId, carDto);

            return new ResponseEntity<>("Rental announcement successfully edited!", HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteRentalAnnouncement(Long id) {

        Optional<RentalAnnouncement> rentalAnnouncement = rentalAnnouncementRepository.findById(id);
        if(rentalAnnouncement.isEmpty()) {
            return new ResponseEntity<>("The rental announcement doesn't exist!", HttpStatus.NOT_FOUND);
        }

        RentalAnnouncement currentRentalAnnouncement = rentalAnnouncement.get();

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(userHasRole(currentUser, ERole.ROLE_ADMIN) || userHasRole(currentUser, ERole.ROLE_MODERATOR)
                    || currentRentalAnnouncement.getRentalCenter().getOrganisation().getOwner().equals(currentUser)) {

                rentalAnnouncementRepository.delete(currentRentalAnnouncement);
                return new ResponseEntity<>("The rental announcement was deleted successfully!", HttpStatus.OK);
            }

            return new ResponseEntity<>("You are not allowed to perform this operation!", HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    private boolean userHasRole(User user, ERole role) {

        for(Role r: user.getRoles()) {
            if(r.getName().equals(role)) {
                return true;
            }
        }

        return false;
    }
}
