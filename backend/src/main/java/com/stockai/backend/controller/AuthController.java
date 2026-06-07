package com.stockai.backend.controller;

import com.stockai.backend.dto.AuthRequest;
import com.stockai.backend.dto.AuthResponse;
import com.stockai.backend.model.Role;
import com.stockai.backend.model.User;
import com.stockai.backend.model.UserStatus;
import com.stockai.backend.repository.UserRepository;
import com.stockai.backend.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("Account not approved yet");
        }
        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token);
    }



    @PostMapping("/register")
    public User register(@RequestBody User user) {

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(Role.WORKSHOP);
        }

        // IMPORTANT: enforce status
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.PENDING);
        }

        return userRepository.save(user);
    }
}