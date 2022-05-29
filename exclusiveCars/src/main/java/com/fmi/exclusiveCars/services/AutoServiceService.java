package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.AutoServiceDto;
import com.fmi.exclusiveCars.model.*;
import com.fmi.exclusiveCars.repository.AutoServiceRepository;
import com.fmi.exclusiveCars.repository.OrganisationRepository;
import com.fmi.exclusiveCars.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class AutoServiceService {
    private final AutoServiceRepository autoServiceRepository;
    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;

    @Autowired
    public AutoServiceService(AutoServiceRepository autoServiceRepository, UserRepository userRepository, OrganisationRepository organisationRepository) {
        this.autoServiceRepository = autoServiceRepository;
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
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

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            Organisation organisation = user.get().getOrganisation();

            AutoService autoServiceToAdd = AutoService.builder()
                    .name(autoServiceDto.getName())
                    .city(autoServiceDto.getCity())
                    .address(autoServiceDto.getAddress())
                    .numberOfStations(autoServiceDto.getNumberOfStations())
                    .email(autoServiceDto.getEmail())
                    .phone(autoServiceDto.getPhone())
                    .organisation(organisation)
                    .build();
            autoServiceRepository.save(autoServiceToAdd);

            organisation.getAutoServices().add(autoServiceToAdd);
            organisationRepository.save(organisation);

            return new ResponseEntity<>("The auto service was added successfully!", HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> editAutoService(Long id, AutoServiceDto autoServiceDto) {
        Optional<AutoService> actualAutoService = autoServiceRepository.findById(id);

        Optional<AutoService> autoServiceByName = autoServiceRepository.findByName(autoServiceDto.getName());
        Optional<AutoService> autoServiceByEmail = autoServiceRepository.findByEmail(autoServiceDto.getEmail());
        Optional<AutoService> autoServiceByPhone = autoServiceRepository.findByPhone(autoServiceDto.getPhone());

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            if (actualAutoService.isPresent()) {

                AutoService currentAutoService = actualAutoService.get();

                User currentUser = user.get();
                Organisation organisation = currentUser.getOrganisation();
                Organisation serviceOrganisation = currentAutoService.getOrganisation();
                if(!userHasRole(currentUser, ERole.ROLE_ADMIN) && !userHasRole(currentUser, ERole.ROLE_MODERATOR)
                        && organisation != serviceOrganisation) {
                    return new ResponseEntity<>("You can't perform this operation!", HttpStatus.FORBIDDEN);
                }

                if ((autoServiceByName.isPresent() && autoServiceByName.get() != actualAutoService.get())
                        || (autoServiceByEmail.isPresent() && autoServiceByEmail.get() != actualAutoService.get())
                        || (autoServiceByPhone.isPresent() && autoServiceByPhone.get() != actualAutoService.get())) {
                    return new ResponseEntity<>("There is already an auto service with this information!", HttpStatus.BAD_REQUEST);
                }

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

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteAutoService(Long id) {
        Optional<AutoService> autoService = autoServiceRepository.findById(id);

        if(autoService.isEmpty()) {
            return new ResponseEntity<>("The auto service you requested to delete doesn't exist!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            AutoService currentAutoService = autoService.get();
            User currentUser = user.get();
            Organisation organisation = currentUser.getOrganisation();

            if(!userHasRole(currentUser, ERole.ROLE_ADMIN) && !userHasRole(currentUser, ERole.ROLE_MODERATOR)
                    && organisation != currentAutoService.getOrganisation()) {
                return new ResponseEntity<>("You can't perform this operation!", HttpStatus.FORBIDDEN);
            }

            if(currentAutoService.getOrganisation() == organisation) {
                organisation.getAutoServices().remove(currentAutoService);
            }

            currentAutoService.setOrganisation(null);
            autoServiceRepository.delete(currentAutoService);
            return new ResponseEntity<>("The auto service was successfully deleted!", HttpStatus.OK);
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
