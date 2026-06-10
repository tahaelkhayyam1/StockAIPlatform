package com.stockai.backend.controller;

import com.stockai.backend.dto.AuthRequest;
import com.stockai.backend.dto.AuthResponse;
import com.stockai.backend.model.Role;
import com.stockai.backend.model.User;
import com.stockai.backend.model.UserStatus;
import com.stockai.backend.repository.UserRepository;
import com.stockai.backend.security.JwtService;
import com.stockai.backend.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final com.stockai.backend.service.NotificationService notificationService;

    public AuthController(UserRepository userRepository, JwtService jwtService, EmailService emailService, com.stockai.backend.service.NotificationService notificationService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @org.springframework.beans.factory.annotation.Value("${app.security.2fa.enabled:true}")
    private boolean twoFactorEnabled;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (Boolean.TRUE.equals(user.getArchived())) {
            throw new RuntimeException("Account archived");
        }

        if (!Boolean.TRUE.equals(user.getApproved())) {
            throw new RuntimeException("Account not approved");
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("Account disabled");
        }

        // Check if 2FA is disabled globally OR if device is trusted
        if (!twoFactorEnabled || (request.getDeviceId() != null && request.getDeviceId().equals(user.getTrustedDeviceId()))) {
            // Bypass 2FA
            user.setLastLogin(LocalDateTime.now());
            
            String deviceIdToReturn = request.getDeviceId();
            if (deviceIdToReturn == null) {
                deviceIdToReturn = java.util.UUID.randomUUID().toString();
                user.setTrustedDeviceId(deviceIdToReturn);
            }
            
            userRepository.save(user);

            String token = jwtService.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(
                    token,
                    user.getRole().name(),
                    user.getEmail(),
                    user.getId(),
                    deviceIdToReturn
            ));
        }

        // Generate 6 digit 2FA code
        String code = String.format("%06d", new Random().nextInt(999999));
        user.setTwoFactorCode(code);
        user.setTwoFactorExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        // Send Email
        emailService.send2FACode(user.getEmail(), code);

        return ResponseEntity.ok(Map.of(
            "requires2FA", true,
            "email", user.getEmail()
        ));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FA(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTwoFactorCode() == null || !user.getTwoFactorCode().equals(code)) {
            throw new RuntimeException("Invalid verification code");
        }

        if (user.getTwoFactorExpiry() == null || user.getTwoFactorExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired");
        }

        // Valid! Clear code and generate JWT
        user.setTwoFactorCode(null);
        user.setTwoFactorExpiry(null);
        user.setLastLogin(LocalDateTime.now());
        
        // Generate a new trusted device token
        String newDeviceId = java.util.UUID.randomUUID().toString();
        user.setTrustedDeviceId(newDeviceId);
        
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getRole().name(),
                user.getEmail(),
                user.getId(),
                newDeviceId
        ));
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(Role.WORKSHOP);
        }

        user.setStatus(UserStatus.PENDING);
        user.setApproved(false);
        user.setActive(false);
        user.setArchived(false);

        User savedUser = userRepository.save(user);
        
        notificationService.notifyRole(Role.SUPER_ADMIN, "New user registration: " + savedUser.getEmail());
        
        return savedUser;
    }
}