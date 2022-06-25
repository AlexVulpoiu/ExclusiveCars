package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.CarDto;
import com.fmi.exclusiveCars.dto.SellingAnnouncementDto;
import com.fmi.exclusiveCars.model.*;
import com.fmi.exclusiveCars.repository.SellingAnnouncementRepository;
import com.fmi.exclusiveCars.repository.UserRepository;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SellingAnnouncementService {

    private final SellingAnnouncementRepository sellingAnnouncementRepository;

    private final UserRepository userRepository;

    private final CarService carService;

    @Autowired
    public SellingAnnouncementService(SellingAnnouncementRepository sellingAnnouncementRepository, UserRepository userRepository, CarService carService) {
        this.sellingAnnouncementRepository = sellingAnnouncementRepository;
        this.userRepository = userRepository;
        this.carService = carService;
    }

    public ResponseEntity<?> getSellingAnnouncements() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if (currentUser.getRoles().size() != 1) {
                return new ResponseEntity<>("Nu poți efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            List<SellingAnnouncement> sellingAnnouncements = sellingAnnouncementRepository.getSellingAnnouncementsByState(EState.ACCEPTED);
            List<SellingAnnouncement> filteredSellingAnnouncements = sellingAnnouncements.stream().filter(
                    announcement -> !announcement.getUser().equals(currentUser)
            ).collect(Collectors.toList());

            return new ResponseEntity<>(filteredSellingAnnouncements, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> getSellingAnnouncement(Long id) {

        Optional<SellingAnnouncement> sellingAnnouncement = sellingAnnouncementRepository.findById(id);
        if(sellingAnnouncement.isEmpty()) {
            return new ResponseEntity<>("Acest anunț de vânzare nu există!", HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(sellingAnnouncement.get(), HttpStatus.OK);
    }

    public ResponseEntity<?> getMySellingAnnouncements() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if (currentUser.getRoles().size() != 1) {
                return new ResponseEntity<>("Nu poți efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            List<SellingAnnouncement> sellingAnnouncements = currentUser.getSellingAnnouncements();
            return new ResponseEntity<>(sellingAnnouncements, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> getSellingAnnouncementsByCar(String filter) {

        List<SellingAnnouncement> sellingAnnouncements = sellingAnnouncementRepository.getSellingAnnouncementsByState(EState.ACCEPTED);
        if(filter == null || filter.trim().length() == 0 || sellingAnnouncements.isEmpty()) {
            return getSellingAnnouncements();
        }

        String[] queries = filter.split(" ");
        String brand = queries[0].toLowerCase();
        String model = "";
        if(queries.length > 1) {
            model = queries[1];
        }
        String finalModel = model.toLowerCase();
        List<SellingAnnouncement> filteredSellingAnnouncements = sellingAnnouncements.stream().filter(
                s -> s.getCar().getModel().getManufacturer().toLowerCase().contains(brand)
                        && s.getCar().getModel().getModel().toLowerCase().contains(finalModel)
        ).collect(Collectors.toList());

        return new ResponseEntity<>(filteredSellingAnnouncements, HttpStatus.OK);
    }

    public ResponseEntity<?> getPendingSellingAnnouncements() {

        List<SellingAnnouncement> pendingSellingAnnouncements = sellingAnnouncementRepository.getSellingAnnouncementsByState(EState.PENDING);
        if(pendingSellingAnnouncements.isEmpty()) {
            return new ResponseEntity<>("Nu sunt anunțuri de vânzare care așteapta aprobare!", HttpStatus.OK);
        }

        return new ResponseEntity<>(pendingSellingAnnouncements, HttpStatus.OK);
    }

    public ResponseEntity<?> addSellingAnnouncement(SellingAnnouncementDto sellingAnnouncementDto) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(currentUser.getRoles().size() != 1) {
                return new ResponseEntity<>("Nu poți efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            CarDto carDto = sellingAnnouncementDto.getCarDto();
            Car car = carService.addCar(carDto);
            String description = sellingAnnouncementDto.getDescription();
            String location = sellingAnnouncementDto.getLocation();
            Boolean negotiable = sellingAnnouncementDto.getNegotiable();

            SellingAnnouncement sellingAnnouncement = SellingAnnouncement.builder()
                    .car(car)
                    .description(description)
                    .location(location)
                    .negotiable(negotiable)
                    .state(EState.PENDING)
                    .build();
            sellingAnnouncementRepository.save(sellingAnnouncement);

            currentUser.addSellingAnnouncement(sellingAnnouncement);
            userRepository.save(currentUser);

            return new ResponseEntity<>(car.getId(), HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> editSellingAnnouncement(Long id, SellingAnnouncementDto sellingAnnouncementDto) {

        Optional<SellingAnnouncement> sellingAnnouncement = sellingAnnouncementRepository.findById(id);
        if(sellingAnnouncement.isEmpty()) {
            return new ResponseEntity<>("Acest anunț nu există!", HttpStatus.NOT_FOUND);
        }

        SellingAnnouncement currentSellingAnnouncement = sellingAnnouncement.get();

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(currentSellingAnnouncement.getUser() != currentUser) {
                return new ResponseEntity<>("Nu poți efectua această acțiune!", HttpStatus.FORBIDDEN);
            }

            Long carId = currentSellingAnnouncement.getCar().getId();
            CarDto carDto = sellingAnnouncementDto.getCarDto();
            carService.editCar(carId, carDto);
            currentSellingAnnouncement.setDescription(sellingAnnouncementDto.getDescription());
            currentSellingAnnouncement.setNegotiable(sellingAnnouncementDto.getNegotiable());
            currentSellingAnnouncement.setLocation(sellingAnnouncementDto.getLocation());
            currentSellingAnnouncement.setState(EState.PENDING);

            sellingAnnouncementRepository.save(currentSellingAnnouncement);

            return new ResponseEntity<>(carId, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteSellingAnnouncement(Long id) {

        Optional<SellingAnnouncement> sellingAnnouncement = sellingAnnouncementRepository.findById(id);
        if(sellingAnnouncement.isEmpty()) {
            return new ResponseEntity<>("Acest anunț de vânzare nu există!", HttpStatus.NOT_FOUND);
        }

        SellingAnnouncement currentSellingAnnouncement = sellingAnnouncement.get();

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if(principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(userHasRole(currentUser, ERole.ROLE_ADMIN) || userHasRole(currentUser, ERole.ROLE_MODERATOR)
                    || currentSellingAnnouncement.getUser() == currentUser) {

                User owner = currentSellingAnnouncement.getUser();
                owner.removeSellingAnnouncement(currentSellingAnnouncement);
                sellingAnnouncementRepository.delete(currentSellingAnnouncement);
                return new ResponseEntity<>("Anunțul de vânzare a fost șters cu succes!", HttpStatus.OK);
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
