package com.stockai.backend.repository;

import com.stockai.backend.model.Notification;
import com.stockai.backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetUser_IdOrTargetRoleOrderByCreatedAtDesc(Long userId, Role role);
}
