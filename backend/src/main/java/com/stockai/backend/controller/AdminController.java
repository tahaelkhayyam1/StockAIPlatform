package com.stockai.backend.controller;

import com.stockai.backend.dto.RoleRequest;
import com.stockai.backend.dto.UserUpdateRequest;
import com.stockai.backend.model.User;
import com.stockai.backend.model.UserStatus;
import com.stockai.backend.repository.UserRepository;
import com.stockai.backend.service.AuditService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.stockai.backend.model.Role;
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminController(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
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
        user.setApproved(true);
        user.setActive(true);

        User saved = userRepository.save(user);
        auditService.logAction("APPROVED USER", user.getEmail());
        return saved;
    }



    // 👇 4. Reject user
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @PostMapping("/users/{id}/archive")
    public User archiveUser(@PathVariable Long id, Authentication authentication) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEmail().equals(authentication.getName())) {
            throw new RuntimeException("You cannot archive yourself.");
        }

        user.setArchived(true);
        user.setActive(false);

        User saved = userRepository.save(user);
        auditService.logAction("ARCHIVED USER", user.getEmail());
        return saved;
    }

    @PostMapping("/users/{id}/unarchive")
    public User unarchiveUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setArchived(false);
        // By default leave active as false until explicit approval, unless status is ACTIVE
        if(user.getStatus() == UserStatus.ACTIVE) {
            user.setActive(true);
        }
        User saved = userRepository.save(user);
        auditService.logAction("RESTORED USER", user.getEmail());
        return saved;
    }


    @PostMapping("/users/{id}/disable")
    public User disableUser(@PathVariable Long id, Authentication authentication) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEmail().equals(authentication.getName())) {
            throw new RuntimeException("You cannot disable yourself.");
        }

        user.setActive(false);

        User saved = userRepository.save(user);
        auditService.logAction("DISABLED USER", user.getEmail());
        return saved;
    }

    @PostMapping("/users/{id}/enable")
    public User enableUser(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);

        User saved = userRepository.save(user);
        auditService.logAction("ENABLED USER", user.getEmail());
        return saved;
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

        User saved = userRepository.save(user);
        auditService.logAction("CHANGED ROLE", user.getEmail() + " -> " + request.getRole());
        return saved;
    }



    @PostMapping("/users/{id}/reset-password")
    public String resetPassword(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String tempPassword = "Temp1234";

        user.setPassword(
                passwordEncoder.encode(tempPassword)
        );

        userRepository.save(user);
        auditService.logAction("RESET PASSWORD", user.getEmail());

        return tempPassword;
    }

    @PutMapping("/users/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAge(request.getAge());

        User saved = userRepository.save(user);
        auditService.logAction("UPDATED USER", user.getEmail());
        return saved;
    }

    // --- SUPER ADMIN NEW ENDPOINTS ---

    @PostMapping("/users")
    public org.springframework.http.ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            // Check if email or username already exists
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                 return org.springframework.http.ResponseEntity.badRequest().body("Error: Email already exists.");
            }
            if (userRepository.findByUsername(user.getUsername()).isPresent()) {
                 return org.springframework.http.ResponseEntity.badRequest().body("Error: Username already exists.");
            }

            // Use provided password or fallback to default temp password
            String rawPassword = (user.getPassword() != null && !user.getPassword().isEmpty()) ? user.getPassword() : "Password123!";
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setStatus(UserStatus.ACTIVE);
            user.setApproved(true);
            user.setActive(true);
            User saved = userRepository.save(user);
            auditService.logAction("CREATED USER", user.getEmail());
            return org.springframework.http.ResponseEntity.ok(saved);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body("An error occurred while creating the user.");
        }
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getEmail().equals(authentication.getName())) {
            throw new RuntimeException("You cannot delete yourself.");
        }
        userRepository.deleteById(id);
        auditService.logAction("DELETED USER", user.getEmail());
    }

    @GetMapping("/users/{id}")
    public User getUserDetails(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/users/search")
    public Page<User> searchUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "false") boolean archived,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        boolean hasSearch = (search != null && !search.trim().isEmpty());
        
        if (!hasSearch && role == null) {
            return userRepository.findByArchivedQuery(archived, pageable);
        } else if (!hasSearch && role != null) {
            return userRepository.findByRoleAndArchivedQuery(role, archived, pageable);
        } else if (hasSearch && role == null) {
            return userRepository.searchUsersByTermAndArchived(search, archived, pageable);
        } else {
            return userRepository.searchUsersByTermAndRoleAndArchived(search, role, archived, pageable);
        }
    }

    @PostMapping("/users/bulk-approve")
    public void bulkApprove(@RequestBody List<Long> userIds) {
        List<User> users = userRepository.findAllById(userIds);
        for (User user : users) {
            user.setStatus(UserStatus.ACTIVE);
            user.setApproved(true);
            user.setActive(true);
            auditService.logAction("APPROVED USER", user.getEmail());
        }
        userRepository.saveAll(users);
    }

    @PostMapping("/users/bulk-disable")
    public void bulkDisable(@RequestBody List<Long> userIds, Authentication authentication) {
        List<User> users = userRepository.findAllById(userIds);
        for (User user : users) {
            if (!user.getEmail().equals(authentication.getName())) {
                user.setActive(false);
                auditService.logAction("DISABLED USER", user.getEmail());
            }
        }
        userRepository.saveAll(users);
    }

    @GetMapping("/users/export")
    public void exportUsersCSV(jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"users_export.csv\"");

        java.io.PrintWriter writer = response.getWriter();
        writer.println("ID,Username,Email,Phone,Age,Role,Status,Approved,Active,Archived");

        List<User> users = userRepository.findAll();
        for (User u : users) {
            writer.printf("%d,%s,%s,%s,%s,%s,%s,%b,%b,%b\n",
                    u.getId(),
                    u.getUsername(),
                    u.getEmail(),
                    u.getPhone() != null ? u.getPhone() : "",
                    u.getAge() != null ? u.getAge().toString() : "",
                    u.getRole() != null ? u.getRole().name() : "",
                    u.getStatus() != null ? u.getStatus().name() : "",
                    u.getApproved() != null ? u.getApproved() : false,
                    u.getActive() != null ? u.getActive() : false,
                    u.getArchived() != null ? u.getArchived() : false);
        }
        auditService.logAction("EXPORTED USERS", "Exported CSV");
    }

}