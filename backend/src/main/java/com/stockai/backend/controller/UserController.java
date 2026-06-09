package com.stockai.backend.controller;

import com.stockai.backend.model.User;
import com.stockai.backend.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public org.springframework.http.ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(org.springframework.http.ResponseEntity::ok)
                .orElse(org.springframework.http.ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setPhone(updatedUser.getPhone());
                    if (updatedUser.getAge() != null) user.setAge(updatedUser.getAge());
                    if (updatedUser.getProfilePicture() != null) user.setProfilePicture(updatedUser.getProfilePicture());
                    
                    userRepository.save(user);
                    return org.springframework.http.ResponseEntity.ok(user);
                })
                .orElse(org.springframework.http.ResponseEntity.notFound().build());
    }
}