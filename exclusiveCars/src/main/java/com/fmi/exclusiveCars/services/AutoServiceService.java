package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.AutoServiceDto;
import com.fmi.exclusiveCars.dto.AutoServiceResponseDto;
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
            return new ResponseEntity<>("Nu a fost adăugat niciun service auto", HttpStatus.OK);
        }

        List<AutoService> autoServiceList = new ArrayList<>(autoServices);
        List<AutoServiceResponseDto> autoServiceResponseDtoList = new ArrayList<>();

        for(AutoService autoService: autoServiceList) {
            AutoServiceResponseDto autoServiceResponseDto = AutoServiceResponseDto.builder()
                    .id(autoService.getId())
                    .name(autoService.getName())
                    .city(autoService.getCity())
                    .address(autoService.getAddress())
                    .email(autoService.getEmail())
                    .phone(autoService.getPhone())
                    .numberOfStations(autoService.getNumberOfStations())
                    .startHour(autoService.getStartHour())
                    .endHour(autoService.getEndHour())
                    .organisation(autoService.getOrganisation().getName())
                    .build();
            autoServiceResponseDtoList.add(autoServiceResponseDto);
        }

        return new ResponseEntity<>(autoServiceResponseDtoList, HttpStatus.OK);
    }

    public ResponseEntity<?> getAutoService(Long id) {
        Optional<AutoService> autoService = autoServiceRepository.findById(id);

        if(autoService.isPresent()) {
            AutoService currentAutoService = autoService.get();

            AutoServiceResponseDto autoServiceResponseDto = AutoServiceResponseDto.builder()
                    .id(currentAutoService.getId())
                    .name(currentAutoService.getName())
                    .city(currentAutoService.getCity())
                    .address(currentAutoService.getAddress())
                    .email(currentAutoService.getEmail())
                    .phone(currentAutoService.getPhone())
                    .numberOfStations(currentAutoService.getNumberOfStations())
                    .startHour(currentAutoService.getStartHour())
                    .endHour(currentAutoService.getEndHour())
                    .organisation(currentAutoService.getOrganisation().getName())
                    .build();

            return new ResponseEntity<>(autoServiceResponseDto, HttpStatus.OK);
        }

        return new ResponseEntity<>("Acest service auto nu există!", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> addAutoService(AutoServiceDto autoServiceDto) {
        Optional<AutoService> autoServiceByName = autoServiceRepository.findByName(autoServiceDto.getName());
        Optional<AutoService> autoServiceByEmail = autoServiceRepository.findByEmail(autoServiceDto.getEmail());
        Optional<AutoService> autoServiceByPhone = autoServiceRepository.findByPhone(autoServiceDto.getPhone());
        if(autoServiceByName.isPresent() || autoServiceByEmail.isPresent() || autoServiceByPhone.isPresent()) {
            return new ResponseEntity<>("Există deja un service auto cu aceste informații de contact!", HttpStatus.BAD_REQUEST);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            Organisation organisation = user.get().getOrganisation();

            AutoService autoServiceToAdd = AutoService.builder()
                    .name(autoServiceDto.getName())
                    .city(autoServiceDto.getCity())
                    .address(autoServiceDto.getAddress())
                    .numberOfStations(autoServiceDto.getNumberOfStations())
                    .startHour(autoServiceDto.getStartHour())
                    .endHour(autoServiceDto.getEndHour())
                    .email(autoServiceDto.getEmail())
                    .phone(autoServiceDto.getPhone())
                    .organisation(organisation)
                    .build();
            autoServiceRepository.save(autoServiceToAdd);

            organisation.getAutoServices().add(autoServiceToAdd);
            organisationRepository.save(organisation);

            return new ResponseEntity<>("Service-ul auto a fost adăugat cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
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
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            if (actualAutoService.isPresent()) {

                AutoService currentAutoService = actualAutoService.get();

                User currentUser = user.get();
                Organisation organisation = currentUser.getOrganisation();
                Organisation serviceOrganisation = currentAutoService.getOrganisation();
                if(!userHasRole(currentUser, ERole.ROLE_ADMIN) && !userHasRole(currentUser, ERole.ROLE_MODERATOR)
                        && organisation != serviceOrganisation) {
                    return new ResponseEntity<>("Nu ai permisiunea de a efectua această operație!", HttpStatus.FORBIDDEN);
                }

                if ((autoServiceByName.isPresent() && autoServiceByName.get() != actualAutoService.get())
                        || (autoServiceByEmail.isPresent() && autoServiceByEmail.get() != actualAutoService.get())
                        || (autoServiceByPhone.isPresent() && autoServiceByPhone.get() != actualAutoService.get())) {
                    return new ResponseEntity<>("Există deja un service auto cu aceste informații de contact!", HttpStatus.BAD_REQUEST);
                }

                currentAutoService.setName(autoServiceDto.getName());
                currentAutoService.setCity(autoServiceDto.getCity());
                currentAutoService.setAddress(autoServiceDto.getAddress());
                currentAutoService.setNumberOfStations(autoServiceDto.getNumberOfStations());
                currentAutoService.setStartHour(autoServiceDto.getStartHour());
                currentAutoService.setEndHour(autoServiceDto.getEndHour());
                currentAutoService.setEmail(autoServiceDto.getEmail());
                currentAutoService.setPhone(autoServiceDto.getPhone());

                autoServiceRepository.save(currentAutoService);
                return new ResponseEntity<>("Service-ul auto a fost editat cu succes!", HttpStatus.OK);
            }

            return new ResponseEntity<>("Acest service auto nu există!", HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteAutoService(Long id) {
        Optional<AutoService> autoService = autoServiceRepository.findById(id);

        if(autoService.isEmpty()) {
            return new ResponseEntity<>("Acest service auto nu există!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            AutoService currentAutoService = autoService.get();
            User currentUser = user.get();
            Organisation organisation = currentUser.getOrganisation();

            if(!userHasRole(currentUser, ERole.ROLE_ADMIN) && !userHasRole(currentUser, ERole.ROLE_MODERATOR)
                    && organisation != currentAutoService.getOrganisation()) {
                return new ResponseEntity<>("Nu ai permisiunea de a efectua această operație!", HttpStatus.FORBIDDEN);
            }

            if(currentAutoService.getOrganisation() == organisation) {
                organisation.getAutoServices().remove(currentAutoService);
            }

            currentAutoService.setOrganisation(null);
            autoServiceRepository.delete(currentAutoService);
            return new ResponseEntity<>("Service-ul auto a fost șters cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
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
