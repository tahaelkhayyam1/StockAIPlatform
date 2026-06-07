package com.stockai.backend.controller;

import com.stockai.backend.dto.RoleRequest;
import com.stockai.backend.model.User;
import com.stockai.backend.model.UserStatus;
import com.stockai.backend.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 👇 1. Get all users
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 👇 2. Get only pending users (VERY IMPORTANT)
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @GetMapping("/users/pending")
    public List<User> getPendingUsers() {
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getStatus() == UserStatus.PENDING)
                .toList();
    }

    // 👇 3. Approve user
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @PostMapping("/users/{id}/approve")
    public User approveUser(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(UserStatus.ACTIVE);

        return userRepository.save(user);
    }

    // 👇 4. Reject user
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @PostMapping("/users/{id}/reject")
    public User rejectUser(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(UserStatus.REJECTED);

        return userRepository.save(user);
    }


    @PostMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public User updateRole(
            @PathVariable Long id,
            @RequestBody RoleRequest request
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(request.getRole());

        return userRepository.save(user);
    }



}