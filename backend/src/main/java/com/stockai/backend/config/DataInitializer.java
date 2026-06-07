package com.stockai.backend.config;

import com.stockai.backend.model.Role;
import com.stockai.backend.model.User;
import com.stockai.backend.model.UserStatus;
import com.stockai.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {

        if (userRepository.findByEmail("admin@system.com").isEmpty()) {

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@system.com");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole(Role.SUPER_ADMIN);
            admin.setStatus(UserStatus.ACTIVE);

            userRepository.save(admin);
        }
    }
}