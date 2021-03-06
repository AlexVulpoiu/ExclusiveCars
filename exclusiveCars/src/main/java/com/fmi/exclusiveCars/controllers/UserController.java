package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.UserEditDto;
import com.fmi.exclusiveCars.model.Role;
import com.fmi.exclusiveCars.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collection;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsers() {
        return new ResponseEntity<>(userService.getUsers(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @GetMapping("/myProfile")
    public ResponseEntity<?> getMyProfile() {
        return userService.getMyProfile();
    }

    @GetMapping("/report/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserReport(@PathVariable Long id) {
        return userService.getUserReport(id);
    }

    @PutMapping("/edit")
    public ResponseEntity<?> editUser(@Valid @RequestBody UserEditDto userEditDto) {
        return userService.editUser(userEditDto);
    }

    @PutMapping("/editRole/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> editUserRoles(@PathVariable Long id, @RequestBody Collection<Role> roles) {
        return userService.editRoles(id, (Set<Role>) roles);
    }

    @GetMapping("/checkPassword/{password}")
    public ResponseEntity<?> checkPassword(@PathVariable String password) {
        return userService.checkPassword(password);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }
}
