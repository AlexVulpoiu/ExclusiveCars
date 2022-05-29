package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.OrganisationDto;
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
            return new ResponseEntity<>("There is no organisation created yet!", HttpStatus.OK);
        }

        List<Organisation> organisationList = new ArrayList<>(organisations);
        return new ResponseEntity<>(organisationList, HttpStatus.OK);
    }

    public ResponseEntity<?> getOrganisation(Long id) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl)principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            Optional<Organisation> organisation = organisationRepository.findById(id);
            if(organisation.isEmpty()) {
                return new ResponseEntity<>("This organisation doesn't exist!", HttpStatus.NOT_FOUND);
            }
            if(user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            if(!userHasRole(user.get(), ERole.ROLE_ADMIN)
                    && !userHasRole(user.get(), ERole.ROLE_MODERATOR)
                    && !organisation.get().getOwner().equals(user.get())) {
                return new ResponseEntity<>("You can't access this page!", HttpStatus.FORBIDDEN);
            }

            return new ResponseEntity<>(organisation.get(), HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> addOrganisation(OrganisationDto organisationDto) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if(user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            if(user.get().getOrganisation() != null) {
                return new ResponseEntity<>("You can't create more than one organisation!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            Optional<Organisation> organisation = organisationRepository.findByName(organisationDto.getName());
            if(organisation.isPresent()) {
                return new ResponseEntity<>("There is already an organisation with this name!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            addOrganisationRole(currentUser);
            Organisation newOrganisation = Organisation.builder()
                    .name(organisationDto.getName())
                    .owner(currentUser)
                    .build();
            currentUser.setOrganisation(newOrganisation);
            userRepository.save(currentUser);

            return new ResponseEntity<>("Organisation successfully added!", HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> editOrganisation(OrganisationDto organisationDto) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(currentUser.getOrganisation() == null) {
                return new ResponseEntity<>("You are not allowed to perform this operation!", HttpStatus.BAD_REQUEST);
            }

            Long organisationId = currentUser.getOrganisation().getId();
            Optional<Organisation> organisation = organisationRepository.findById(organisationId);
            if(organisation.isEmpty()) {
                return new ResponseEntity<>("You are not allowed to perform this operation!", HttpStatus.BAD_REQUEST);
            }

            Optional<Organisation> organisationByName = organisationRepository.findByName(organisationDto.getName());
            if(organisationByName.isPresent() && !organisation.get().equals(organisationByName.get())) {
                return new ResponseEntity<>("There is already an organisation with this name!", HttpStatus.BAD_REQUEST);
            }

            Organisation currentOrganisation = organisation.get();
            currentOrganisation.setName(organisationDto.getName());
            organisationRepository.save(currentOrganisation);

            return new ResponseEntity<>("The organisation was successfully deleted!", HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteOrganisation(Long id) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            Optional<Organisation> organisation = organisationRepository.findById(id);
            if(organisation.isEmpty()) {
                return new ResponseEntity<>("This organisation doesn't exist!", HttpStatus.NOT_FOUND);
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

                return new ResponseEntity<>("The organisation was successfully deleted!", HttpStatus.OK);
            }

            return new ResponseEntity<>("You can't perform this action!", HttpStatus.FORBIDDEN);
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
