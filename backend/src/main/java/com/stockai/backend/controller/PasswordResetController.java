package com.stockai.backend.controller;

import com.stockai.backend.model.PasswordResetRequest;
import com.stockai.backend.model.User;
import com.stockai.backend.repository.PasswordResetRequestRepository;
import com.stockai.backend.repository.UserRepository;
import com.stockai.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PasswordResetController {

    @Autowired
    private PasswordResetRequestRepository resetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/auth/forgot-password")
    public String requestPasswordReset(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        // Just create the request, don't reveal if user exists to prevent email enumeration
        PasswordResetRequest request = new PasswordResetRequest();
        request.setEmail(email);
        resetRepository.save(request);

        return "Request submitted successfully";
    }

    @GetMapping("/superadmin/reset-requests")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<PasswordResetRequest> getAllRequests() {
        return resetRepository.findAll();
    }

    @PostMapping("/superadmin/reset-requests/{id}/resolve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public PasswordResetRequest resolveRequest(@PathVariable Long id) {
        PasswordResetRequest request = resetRepository.findById(id).orElseThrow();
        
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            // Generate a random 8-character password
            String newPassword = UUID.randomUUID().toString().substring(0, 8);
            
            // Update password in DB
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            // Send email
            emailService.sendPasswordResetEmail(user.getEmail(), newPassword);
        }

        request.setStatus(PasswordResetRequest.Status.RESOLVED);
        return resetRepository.save(request);
    }
}
