package com.stockai.backend.controller;

import com.stockai.backend.model.Notification;
import com.stockai.backend.model.User;
import com.stockai.backend.repository.NotificationRepository;
import com.stockai.backend.repository.UserRepository;
import com.stockai.backend.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService,
                                  NotificationRepository notificationRepository,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Notification> getMyNotifications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationService.getNotificationsForUser(user.getId(), user.getRole());
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id, Authentication authentication) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
