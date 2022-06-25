package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.RentalAnnouncement;
import com.fmi.exclusiveCars.model.User;
import com.fmi.exclusiveCars.repository.RentalAnnouncementRepository;
import com.fmi.exclusiveCars.repository.UserRepository;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteRentalAnnouncementService {
    
    private final UserRepository userRepository;
    
    private final RentalAnnouncementRepository rentalAnnouncementRepository;

    @Autowired
    public FavoriteRentalAnnouncementService(UserRepository userRepository, RentalAnnouncementRepository rentalAnnouncementRepository) {
        this.userRepository = userRepository;
        this.rentalAnnouncementRepository = rentalAnnouncementRepository;
    }
    
    public ResponseEntity<?> getFavoriteRentalAnnouncements() {
        
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

            return new ResponseEntity<>(currentUser.getFavoriteRentalAnnouncements(), HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }
    
    public ResponseEntity<?> addToFavorites(Long id) {

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

            Optional<RentalAnnouncement> rentalAnnouncement = rentalAnnouncementRepository.findById(id);
            if(rentalAnnouncement.isEmpty()) {
                return new ResponseEntity<>("Acest anunț nu există!", HttpStatus.NOT_FOUND);
            }

            RentalAnnouncement currentRentalAnnouncement = rentalAnnouncement.get();

            List<RentalAnnouncement> favoriteRentalAnnouncements = currentUser.getFavoriteRentalAnnouncements();
            favoriteRentalAnnouncements.add(currentRentalAnnouncement);
            currentUser.setFavoriteRentalAnnouncements(favoriteRentalAnnouncements);
            userRepository.save(currentUser);

            return new ResponseEntity<>("Anunțul a fost adăugat la favorite!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }
    
    public ResponseEntity<?> removeFromFavorites(Long id) {

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

            Optional<RentalAnnouncement> rentalAnnouncement = rentalAnnouncementRepository.findById(id);
            if(rentalAnnouncement.isEmpty()) {
                return new ResponseEntity<>("Acest anunț nu există!", HttpStatus.NOT_FOUND);
            }

            RentalAnnouncement currentRentalAnnouncement = rentalAnnouncement.get();

            List<RentalAnnouncement> favoriteRentalAnnouncements = currentUser.getFavoriteRentalAnnouncements();
            favoriteRentalAnnouncements.remove(currentRentalAnnouncement);
            currentUser.setFavoriteRentalAnnouncements(favoriteRentalAnnouncements);
            userRepository.save(currentUser);

            return new ResponseEntity<>("Anunțul a fost eliminat de la favorite!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }
}
