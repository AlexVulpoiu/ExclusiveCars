package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.UserDto;
import com.fmi.exclusiveCars.dto.UserEditDto;
import com.fmi.exclusiveCars.model.ERole;
import com.fmi.exclusiveCars.model.Role;
import com.fmi.exclusiveCars.model.User;
import com.fmi.exclusiveCars.repository.UserRepository;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    @Autowired
    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public ResponseEntity<?> getUser(Long id) {
        Optional<User> currentUser = userRepository.findById(id);

        if(currentUser.isPresent()) {
            User user = currentUser.get();
            UserDto userDto = mapUserToUserDto(user);

            return new ResponseEntity<>(userDto, HttpStatus.OK);
        }
        return new ResponseEntity<>("Acest utilizator nu există!", HttpStatus.NOT_FOUND);
   }

    public Boolean isAdmin(User user) {
        for(Role role: user.getRoles()) {
            if(role.getName().equals(ERole.ROLE_ADMIN)) {
                return true;
            }
        }

        return false;
    }

    public ResponseEntity<?> editUser(UserEditDto userEditDto) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            currentUser.setFirstName(userEditDto.getFirstName());
            currentUser.setLastName(userEditDto.getLastName());
            currentUser.setPhone(userEditDto.getPhone());

            String newPassword = userEditDto.getNewPassword();
            if(newPassword != null && !Objects.equals(newPassword, "")) {
                currentUser.setPassword(passwordEncoder.encode(newPassword));
            }
            userRepository.save(currentUser);

            return new ResponseEntity<>("Editarea contului a fost realizată cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> editRoles(Long id, Set<Role> roles) {
        Optional<User> user = userRepository.findById(id);

        if(user.isPresent()) {
            User currentUser = user.get();
            if(isAdmin(currentUser)) {
                return new ResponseEntity<>("Nu ai dreptul de a efectua această acțiune!", HttpStatus.FORBIDDEN);
            }

            currentUser.setRoles(roles);
            userRepository.save(currentUser);

            return new ResponseEntity<>(currentUser, HttpStatus.OK);
        }

        return new ResponseEntity<>("Acest utilizator nu există!", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> checkPassword(String password) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl)principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if(user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii tale. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            String encodedPassword = currentUser.getPassword();

            boolean check = passwordEncoder.matches(password, encodedPassword);

            return new ResponseEntity<>(String.valueOf(check), HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii tale. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);

        if(user.isPresent()) {
            User currentUser = user.get();
            if(isAdmin(currentUser)) {
                return new ResponseEntity<>("Nu ai dreptul de a efectua această acțiune!", HttpStatus.FORBIDDEN);
            }
        }

        userRepository.deleteById(id);
        return new ResponseEntity<>("Utilizatorul a fost șters cu succes!", HttpStatus.OK);
    }

    public ResponseEntity<?> getMyProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl)principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if(user.isPresent()) {
                User currentUser = user.get();
                UserDto userDto = mapUserToUserDto(currentUser);
                return new ResponseEntity<>(userDto, HttpStatus.OK);
            }
            return new ResponseEntity<>("Acest utilizator nu există!", HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii tale. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> getUserReport(Long id) {

        Optional<User> currentUser = userRepository.findById(id);
        if(currentUser.isEmpty()) {
            return new ResponseEntity<>("Acest utilizator nu există", HttpStatus.NOT_FOUND);
        }

        User user = currentUser.get();
        if(user.getOrganisation() != null) {
            return new ResponseEntity<>(user.getOrganisation(), HttpStatus.OK);
        }

        return new ResponseEntity<>(user.getSellingAnnouncements(), HttpStatus.OK);
    }

    private UserDto mapUserToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }
}
