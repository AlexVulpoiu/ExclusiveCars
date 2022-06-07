package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.OrganisationDto;
import com.fmi.exclusiveCars.dto.OrganisationResponseDto;
import com.fmi.exclusiveCars.model.ERole;
import com.fmi.exclusiveCars.model.Organisation;
import com.fmi.exclusiveCars.model.Role;
import com.fmi.exclusiveCars.model.User;
import com.fmi.exclusiveCars.repository.OrganisationRepository;
import com.fmi.exclusiveCars.repository.RoleRepository;
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
public class OrganisationService {

    private final OrganisationRepository organisationRepository;

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    @Autowired
    public OrganisationService(OrganisationRepository organisationRepository, UserRepository userRepository, RoleRepository roleRepository) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public ResponseEntity<?> getAllOrganisations() {

        Collection<Organisation> organisations = organisationRepository.findAll();
        if(organisations.isEmpty()) {
            return new ResponseEntity<>("Momentan nu există nicio organizație!", HttpStatus.OK);
        }

        List<OrganisationResponseDto> organisationList = new ArrayList<>();
        for(Organisation organisation: organisations) {
            OrganisationResponseDto organisationResponseDto = OrganisationResponseDto.builder()
                    .id(organisation.getId())
                    .name(organisation.getName())
                    .owner(organisation.getOwner().getFirstName() + " " + organisation.getOwner().getLastName())
                    .ownerId(organisation.getOwner().getId())
                    .build();
            organisationList.add(organisationResponseDto);
        }
        return new ResponseEntity<>(organisationList, HttpStatus.OK);
    }

    public ResponseEntity<?> getOrganisation(Long id) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl)principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            Optional<Organisation> organisation = organisationRepository.findById(id);
            if(organisation.isEmpty()) {
                return new ResponseEntity<>("Această organizație nu există!", HttpStatus.NOT_FOUND);
            }
            if(user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            if(!userHasRole(user.get(), ERole.ROLE_ADMIN)
                    && !userHasRole(user.get(), ERole.ROLE_MODERATOR)
                    && !organisation.get().getOwner().equals(user.get())) {
                return new ResponseEntity<>("Nu ai permisiunea de a accesa această pagină!", HttpStatus.FORBIDDEN);
            }

            Organisation currentOrganisation = organisation.get();

            OrganisationResponseDto organisationResponseDto = OrganisationResponseDto.builder()
                    .id(currentOrganisation.getId())
                    .name(currentOrganisation.getName())
                    .owner(currentOrganisation.getOwner().getFirstName() + " " + currentOrganisation.getOwner().getLastName())
                    .ownerId(currentOrganisation.getOwner().getId())
                    .build();

            return new ResponseEntity<>(organisationResponseDto, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> getMyOrganisation() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            Organisation organisation = user.get().getOrganisation();
            OrganisationResponseDto organisationResponseDto = OrganisationResponseDto.builder()
                    .id(organisation.getId())
                    .name(organisation.getName())
                    .owner(organisation.getOwner().getFirstName() + " " + organisation.getOwner().getLastName())
                    .ownerId(organisation.getOwner().getId())
                    .build();

            return new ResponseEntity<>(organisationResponseDto, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> addOrganisation(OrganisationDto organisationDto) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if(user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            if(user.get().getOrganisation() != null) {
                return new ResponseEntity<>("Poți deține o singură organizație!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            Optional<Organisation> organisation = organisationRepository.findByName(organisationDto.getName());
            if(organisation.isPresent()) {
                return new ResponseEntity<>("Acest nume este deținut deja de altă organizație!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            addOrganisationRole(currentUser);
            Organisation newOrganisation = Organisation.builder()
                    .name(organisationDto.getName())
                    .owner(currentUser)
                    .build();
            currentUser.setOrganisation(newOrganisation);
            userRepository.save(currentUser);

            return new ResponseEntity<>("Organizația a fost adăugată cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> editOrganisation(OrganisationDto organisationDto) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(currentUser.getOrganisation() == null) {
                return new ResponseEntity<>("Nu ai permisiunea de a efectua această operație!", HttpStatus.BAD_REQUEST);
            }

            Long organisationId = currentUser.getOrganisation().getId();
            Optional<Organisation> organisation = organisationRepository.findById(organisationId);
            if(organisation.isEmpty()) {
                return new ResponseEntity<>("Nu ai permisiunea de a efectua această operație!", HttpStatus.BAD_REQUEST);
            }

            Optional<Organisation> organisationByName = organisationRepository.findByName(organisationDto.getName());
            if(organisationByName.isPresent() && !organisation.get().equals(organisationByName.get())) {
                return new ResponseEntity<>("Acest nume este deținut deja de altă organizație!", HttpStatus.BAD_REQUEST);
            }

            Organisation currentOrganisation = organisation.get();
            currentOrganisation.setName(organisationDto.getName());
            organisationRepository.save(currentOrganisation);

            return new ResponseEntity<>("Organizația a fost editată cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteOrganisation(Long id) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            Optional<Organisation> organisation = organisationRepository.findById(id);
            if(organisation.isEmpty()) {
                return new ResponseEntity<>("Această rganizație nu există!", HttpStatus.NOT_FOUND);
            }

            Organisation currentOrganisation = organisation.get();
            User currentUser = user.get();
            if(userHasRole(currentUser, ERole.ROLE_ADMIN) || userHasRole(currentUser, ERole.ROLE_MODERATOR)
                || currentOrganisation.getOwner().equals(currentUser)) {

                User owner = currentOrganisation.getOwner();
                owner.setOrganisation(null);
                removeOrganisationRole(owner);
                userRepository.save(owner);

                currentOrganisation.setOwner(null);
                organisationRepository.delete(currentOrganisation);

                return new ResponseEntity<>("Organizația a fost ștearsă cu succes!", HttpStatus.OK);
            }

            return new ResponseEntity<>("Nu ai permisiunea de a efectua această operație!", HttpStatus.FORBIDDEN);
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

    private void addOrganisationRole(User user) {

        Optional<Role> organisationRole = roleRepository.findByName(ERole.ROLE_ORGANISATION);
        organisationRole.ifPresent(role -> user.getRoles().add(role));
        userRepository.save(user);
    }

    private void removeOrganisationRole(User user) {

        Optional<Role> organisationRole = roleRepository.findByName(ERole.ROLE_ORGANISATION);
        organisationRole.ifPresent(role -> user.getRoles().remove(role));
        userRepository.save(user);
    }
}
