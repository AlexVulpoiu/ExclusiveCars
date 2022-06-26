package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.CarDto;
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

import java.util.*;
import java.util.stream.Collectors;

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

        List<RentalAnnouncement> rentalAnnouncements = rentalAnnouncementRepository.getRentalAnnouncementsByState(EState.ACCEPTED);

        return new ResponseEntity<>(rentalAnnouncements, HttpStatus.OK);
    }

    public ResponseEntity<?> getPendingRentalAnnouncements() {

        List<RentalAnnouncement> pendingRentalAnnouncements = rentalAnnouncementRepository.getRentalAnnouncementsByState(EState.PENDING);
        if(pendingRentalAnnouncements.isEmpty()) {
            return new ResponseEntity<>("Nu sunt anunțuri de închiriere care așteapta aprobare!", HttpStatus.OK);
        }

        return new ResponseEntity<>(pendingRentalAnnouncements, HttpStatus.OK);
    }

    public ResponseEntity<?> getRentalAnnouncement(Long id) {

        Optional<RentalAnnouncement> rentalAnnouncement = rentalAnnouncementRepository.findById(id);
        if(rentalAnnouncement.isEmpty()) {
            return new ResponseEntity<>("Acest anunț de închiriere nu există!", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(rentalAnnouncement.get(), HttpStatus.OK);
    }

    public ResponseEntity<?> getRentalAnnouncementsByCar(String filter, Long id) {

        List<RentalAnnouncement> rentalAnnouncements = rentalAnnouncementRepository.getRentalAnnouncementsFromRentalCenterByState(id, EState.ACCEPTED);
        if(filter == null || filter.trim().length() == 0 || rentalAnnouncements.isEmpty()) {
            return getRentalAnnouncementsFromRentalCenter(id);
        }

        String[] queries = filter.split(" ");
        String brand = queries[0].toLowerCase();
        String model = "";
        if(queries.length > 1) {
            model = queries[1];
        }
        String finalModel = model.toLowerCase();
        List<RentalAnnouncement> filteredRentalAnnouncements = rentalAnnouncements.stream().filter(
                r -> r.getCar().getModel().getManufacturer().toLowerCase().contains(brand)
                        && r.getCar().getModel().getModel().toLowerCase().contains(finalModel)
        ).collect(Collectors.toList());

        return new ResponseEntity<>(filteredRentalAnnouncements, HttpStatus.OK);
    }

    public ResponseEntity<?> getRentalAnnouncementsFromRentalCenter(Long rentalCenterId) {

        List<RentalAnnouncement> rentalAnnouncements = 
                rentalAnnouncementRepository.getRentalAnnouncementsFromRentalCenterByState(rentalCenterId, EState.ACCEPTED);
        
        return new ResponseEntity<>(rentalAnnouncements, HttpStatus.OK);
    }

    public ResponseEntity<?> getMyRentalAnnouncements() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if (currentUser.getOrganisation() == null) {
                return new ResponseEntity<>("Nu poți efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            List<RentalAnnouncement> myRentalAnnouncements = new ArrayList<>();
            Set<RentalCenter> rentalCenters = currentUser.getOrganisation().getRentalCenters();
            for(RentalCenter rentalCenter: rentalCenters) {
                myRentalAnnouncements.addAll(rentalCenter.getRentalAnnouncements());
            }
            myRentalAnnouncements.sort((o1, o2) -> {
                String name1 = o1.getCar().getModel().getManufacturer() + " " + o1.getCar().getModel().getModel();
                String name2 = o2.getCar().getModel().getManufacturer() + " " + o2.getCar().getModel().getModel();

                return name1.compareTo(name2);
            });

            return new ResponseEntity<>(myRentalAnnouncements, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> addRentalAnnouncement(Long rentalCenterId, CarDto carDto) {

        Optional<RentalCenter> rentalCenter = rentalCenterRepository.findById(rentalCenterId);
        if(rentalCenter.isEmpty()) {
            return new ResponseEntity<>("Centrul de închiriere nu există!", HttpStatus.NOT_FOUND);
        }

        RentalCenter currentRentalCenter = rentalCenter.get();

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(!currentRentalCenter.getOrganisation().getOwner().equals(currentUser)) {
                return new ResponseEntity<>("Nu ai dreptul de a efectua această acțiune!", HttpStatus.FORBIDDEN);
            }

            Car car = carService.addCar(carDto);
            RentalAnnouncement rentalAnnouncement = RentalAnnouncement.builder()
                    .state(EState.PENDING)
                    .car(car)
                    .rentalCenter(currentRentalCenter)
                    .build();
            rentalAnnouncementRepository.save(rentalAnnouncement);

            currentRentalCenter.getRentalAnnouncements().add(rentalAnnouncement);
            rentalCenterRepository.save(currentRentalCenter);

            // returnez id-ul mașinii pentru a putea adăuga și pozele
            return new ResponseEntity<>(car.getId(), HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> editRentalAnnouncement(Long id, CarDto carDto) {

        Optional<RentalAnnouncement> rentalAnnouncement = rentalAnnouncementRepository.findById(id);
        if(rentalAnnouncement.isEmpty()) {
            return new ResponseEntity<>("Acest anunț de închiriere nu există!", HttpStatus.NOT_FOUND);
        }

        RentalAnnouncement currentRentalAnnouncement = rentalAnnouncement.get();

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(!currentRentalAnnouncement.getRentalCenter().getOrganisation().getOwner().equals(currentUser)) {
                return new ResponseEntity<>("Nu poți efectua această acțiune!", HttpStatus.FORBIDDEN);
            }

            Long carId = currentRentalAnnouncement.getCar().getId();
            carService.editCar(carId, carDto);
            currentRentalAnnouncement.setState(EState.PENDING);
            rentalAnnouncementRepository.save(currentRentalAnnouncement);

            return new ResponseEntity<>(carId, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteRentalAnnouncement(Long id) {

        Optional<RentalAnnouncement> rentalAnnouncement = rentalAnnouncementRepository.findById(id);
        if(rentalAnnouncement.isEmpty()) {
            return new ResponseEntity<>("Acest anunț de închiriere nu există!", HttpStatus.NOT_FOUND);
        }

        RentalAnnouncement currentRentalAnnouncement = rentalAnnouncement.get();

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(userHasRole(currentUser, ERole.ROLE_ADMIN) || userHasRole(currentUser, ERole.ROLE_MODERATOR)
                    || currentRentalAnnouncement.getRentalCenter().getOrganisation().getOwner().equals(currentUser)) {

                rentalAnnouncementRepository.delete(currentRentalAnnouncement);
                return new ResponseEntity<>("Anunțul de închiriere a fost șters cu succes!", HttpStatus.OK);
            }

            return new ResponseEntity<>("Nu ai permisiunea de a efectua această acțiune!", HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
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
