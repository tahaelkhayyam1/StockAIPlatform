package com.stockai.backend.service;

import com.stockai.backend.model.Notification;
import com.stockai.backend.model.Role;
import com.stockai.backend.model.User;
import com.stockai.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void notifyRole(Role targetRole, String message) {
        Notification notification = new Notification();
        notification.setTargetRole(targetRole);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    public void notifyUser(User targetUser, String message) {
        Notification notification = new Notification();
        notification.setTargetUser(targetUser);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId, Role userRole) {
        return notificationRepository.findByTargetUser_IdOrTargetRoleOrderByCreatedAtDesc(userId, userRole);
    }
}
