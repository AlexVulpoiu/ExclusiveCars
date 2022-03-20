package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.ERole;
import com.fmi.exclusiveCars.model.Role;
import com.fmi.exclusiveCars.model.User;
import com.fmi.exclusiveCars.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ResponseEntity<?> getUser(Long id) {
        Optional<User> currentUser = userRepository.findById(id);

        if(currentUser.isPresent()) {
            return new ResponseEntity<>(currentUser.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
   }

    public Boolean isAdmin(User user) {
        for(Role role: user.getRoles()) {
            if(role.getName().equals(ERole.ROLE_ADMIN)) {
                return true;
            }
        }

        return false;
    }

    public ResponseEntity<?> editRoles(Long id, Set<Role> roles) {
        Optional<User> user = userRepository.findById(id);

        if(user.isPresent()) {
            User currentUser = user.get();
            if(isAdmin(currentUser)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            currentUser.setRoles(roles);
            userRepository.save(currentUser);

            return new ResponseEntity<>(currentUser, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<HttpStatus> deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);

        if(user.isPresent()) {
            User currentUser = user.get();
            if(isAdmin(currentUser)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }

        userRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
