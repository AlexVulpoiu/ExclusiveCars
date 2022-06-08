package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.RentalCenterDto;
import com.fmi.exclusiveCars.dto.RentalCenterResponseDto;
import com.fmi.exclusiveCars.model.*;
import com.fmi.exclusiveCars.repository.OrganisationRepository;
import com.fmi.exclusiveCars.repository.RentalCenterRepository;
import com.fmi.exclusiveCars.repository.UserRepository;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class RentalCenterService {
    private final RentalCenterRepository rentalCenterRepository;
    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;

    @Autowired
    public RentalCenterService(RentalCenterRepository rentalCenterRepository, UserRepository userRepository, OrganisationRepository organisationRepository) {
        this.rentalCenterRepository = rentalCenterRepository;
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
    }

    public ResponseEntity<?> getAllRentalCenters() {
        Collection<RentalCenter> rentalCenters = rentalCenterRepository.findAll();
        if(rentalCenters.isEmpty()) {
            return new ResponseEntity<>("Încă nu a fost adăugat niciun centru de închiriere!", HttpStatus.OK);
        }

        List<RentalCenter> rentalCenterList = new ArrayList<>(rentalCenters);
        List<RentalCenterResponseDto> rentalCenterResponseDtoList = new ArrayList<>();
        for(RentalCenter rentalCenter: rentalCenterList) {
            RentalCenterResponseDto rentalCenterResponseDto = RentalCenterResponseDto.builder()
                    .id(rentalCenter.getId())
                    .name(rentalCenter.getName())
                    .city(rentalCenter.getCity())
                    .address(rentalCenter.getAddress())
                    .email(rentalCenter.getEmail())
                    .phone(rentalCenter.getPhone())
                    .organisation(rentalCenter.getOrganisation().getName())
                    .build();
            rentalCenterResponseDtoList.add(rentalCenterResponseDto);
        }

        return new ResponseEntity<>(rentalCenterResponseDtoList, HttpStatus.OK);
    }

    public ResponseEntity<?> getRentalCenter(Long id) {
        Optional<RentalCenter> rentalCenter = rentalCenterRepository.findById(id);

        if(rentalCenter.isPresent()) {
            RentalCenter currentRentalCenter = rentalCenter.get();
            RentalCenterResponseDto rentalCenterResponseDto = RentalCenterResponseDto.builder()
                    .id(currentRentalCenter.getId())
                    .name(currentRentalCenter.getName())
                    .city(currentRentalCenter.getCity())
                    .address(currentRentalCenter.getAddress())
                    .email(currentRentalCenter.getEmail())
                    .phone(currentRentalCenter.getPhone())
                    .organisation(currentRentalCenter.getOrganisation().getName())
                    .build();
            return new ResponseEntity<>(rentalCenterResponseDto, HttpStatus.OK);
        }

        return new ResponseEntity<>("Centrul de închirieri căutat nu există!", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> addRentalCenter(RentalCenterDto rentalCenterDto) {
        Optional<RentalCenter> rentalCenterByName = rentalCenterRepository.findByName(rentalCenterDto.getName());
        Optional<RentalCenter> rentalCenterByEmail = rentalCenterRepository.findByEmail(rentalCenterDto.getEmail());
        Optional<RentalCenter> rentalCenterByPhone = rentalCenterRepository.findByPhone(rentalCenterDto.getPhone());
        if(rentalCenterByName.isPresent() || rentalCenterByEmail.isPresent() || rentalCenterByPhone.isPresent()) {
            return new ResponseEntity<>("Există deja un centru de închirieri cu aceleași informații!", HttpStatus.BAD_REQUEST);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            Organisation organisation = user.get().getOrganisation();

            RentalCenter rentalCenterToAdd = RentalCenter.builder()
                    .name(rentalCenterDto.getName())
                    .city(rentalCenterDto.getCity())
                    .address(rentalCenterDto.getAddress())
                    .email(rentalCenterDto.getEmail())
                    .phone(rentalCenterDto.getPhone())
                    .organisation(organisation)
                    .build();
            rentalCenterRepository.save(rentalCenterToAdd);

            organisation.getRentalCenters().add(rentalCenterToAdd);
            organisationRepository.save(organisation);

            return new ResponseEntity<>("Centrul de închirieri a fost adăugat cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> editRentalCenter(Long id, RentalCenterDto rentalCenterDto) {
        Optional<RentalCenter> actualRentalCenter = rentalCenterRepository.findById(id);

        Optional<RentalCenter> rentalCenterByName = rentalCenterRepository.findByName(rentalCenterDto.getName());
        Optional<RentalCenter> rentalCenterByEmail = rentalCenterRepository.findByEmail(rentalCenterDto.getEmail());
        Optional<RentalCenter> rentalCenterByPhone = rentalCenterRepository.findByPhone(rentalCenterDto.getPhone());

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            if(actualRentalCenter.isPresent()) {

                RentalCenter currentRentalCenter = actualRentalCenter.get();

                User currentUser = user.get();
                Organisation organisation = currentUser.getOrganisation();
                Organisation rentalCenterOrganisation = currentRentalCenter.getOrganisation();
                if(!userHasRole(currentUser, ERole.ROLE_ADMIN) && !userHasRole(currentUser, ERole.ROLE_MODERATOR)
                        && organisation != rentalCenterOrganisation) {
                    return new ResponseEntity<>("Nu ai dreptul de a efectua această operație!", HttpStatus.FORBIDDEN);
                }

                if((rentalCenterByName.isPresent() && rentalCenterByName.get() != actualRentalCenter.get())
                        || (rentalCenterByEmail.isPresent() && rentalCenterByEmail.get() != actualRentalCenter.get())
                        || (rentalCenterByPhone.isPresent() && rentalCenterByPhone.get() != actualRentalCenter.get())) {
                    return new ResponseEntity<>("Există deja un centrude închirieri cu aceaste informații!", HttpStatus.BAD_REQUEST);
                }

                currentRentalCenter.setName(rentalCenterDto.getName());
                currentRentalCenter.setCity(rentalCenterDto.getCity());
                currentRentalCenter.setAddress(rentalCenterDto.getAddress());
                currentRentalCenter.setEmail(rentalCenterDto.getEmail());
                currentRentalCenter.setPhone(rentalCenterDto.getPhone());

                rentalCenterRepository.save(currentRentalCenter);
                return new ResponseEntity<>("Centrul de închirieri a fost editat cu succes!", HttpStatus.OK);
            }

            return new ResponseEntity<>("Centrul de închirieri căutat nu există!", HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteRentalCenter(Long id) {
        Optional<RentalCenter> rentalCenter = rentalCenterRepository.findById(id);

        if(rentalCenter.isEmpty()) {
            return new ResponseEntity<>("Acest centru de închirieri nu există!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            RentalCenter currentRentalCenter = rentalCenter.get();
            User currentUser = user.get();
            Organisation organisation = currentUser.getOrganisation();

            if(!userHasRole(currentUser, ERole.ROLE_ADMIN) && !userHasRole(currentUser, ERole.ROLE_MODERATOR)
                    && organisation != currentRentalCenter.getOrganisation()) {
                return new ResponseEntity<>("Nu ai dreptul de a efectua această acțiune!", HttpStatus.FORBIDDEN);
            }

            if(currentRentalCenter.getOrganisation() == organisation) {
                organisation.getRentalCenters().remove(currentRentalCenter);
            }

            currentRentalCenter.setOrganisation(null);
            rentalCenterRepository.delete(currentRentalCenter);
            return new ResponseEntity<>("Centrul de închirieri a fost șters cu succes!", HttpStatus.OK);
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
