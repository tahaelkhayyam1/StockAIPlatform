package com.stockai.backend.service;

import com.stockai.backend.model.AuditLog;
import com.stockai.backend.model.User;
import com.stockai.backend.repository.AuditLogRepository;
import com.stockai.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public void logAction(String action, String details) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = "SYSTEM";
        String role = "SYSTEM";

        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                role = user.getRole().name();
            }
        }

        AuditLog log = new AuditLog();
        log.setTimestamp(LocalDateTime.now());
        log.setActorEmail(email);
        log.setActorRole(role);
        log.setAction(action);
        log.setDetails(details);

        auditLogRepository.save(log);
    }
}
