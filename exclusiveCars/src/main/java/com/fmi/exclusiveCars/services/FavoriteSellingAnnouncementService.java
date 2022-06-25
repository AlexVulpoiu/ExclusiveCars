package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.SellingAnnouncement;
import com.fmi.exclusiveCars.model.User;
import com.fmi.exclusiveCars.repository.SellingAnnouncementRepository;
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
public class FavoriteSellingAnnouncementService {

    private final UserRepository userRepository;

    private final SellingAnnouncementRepository sellingAnnouncementRepository;

    @Autowired
    public FavoriteSellingAnnouncementService(UserRepository userRepository, SellingAnnouncementRepository sellingAnnouncementRepository) {
        this.userRepository = userRepository;
        this.sellingAnnouncementRepository = sellingAnnouncementRepository;
    }

    public ResponseEntity<?> getFavoriteSellingAnnouncements() {

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

            return new ResponseEntity<>(currentUser.getFavoriteSellingAnnouncements(), HttpStatus.OK);
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

            Optional<SellingAnnouncement> sellingAnnouncement = sellingAnnouncementRepository.findById(id);
            if(sellingAnnouncement.isEmpty()) {
                return new ResponseEntity<>("Acest anunț nu există!", HttpStatus.NOT_FOUND);
            }

            SellingAnnouncement currentSellingAnnouncement = sellingAnnouncement.get();

            List<SellingAnnouncement> favoriteSellingAnnouncements = currentUser.getFavoriteSellingAnnouncements();
            favoriteSellingAnnouncements.add(currentSellingAnnouncement);
            currentUser.setFavoriteSellingAnnouncements(favoriteSellingAnnouncements);
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

            Optional<SellingAnnouncement> sellingAnnouncement = sellingAnnouncementRepository.findById(id);
            if(sellingAnnouncement.isEmpty()) {
                return new ResponseEntity<>("Acest anunț nu există!", HttpStatus.NOT_FOUND);
            }

            SellingAnnouncement currentSellingAnnouncement = sellingAnnouncement.get();

            List<SellingAnnouncement> favoriteSellingAnnouncements = currentUser.getFavoriteSellingAnnouncements();
            favoriteSellingAnnouncements.remove(currentSellingAnnouncement);
            currentUser.setFavoriteSellingAnnouncements(favoriteSellingAnnouncements);
            userRepository.save(currentUser);

            return new ResponseEntity<>("Anunțul a fost eliminat de la favorite!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }
}
