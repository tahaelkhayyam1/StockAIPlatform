package com.stockai.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    private Integer age;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.PENDING;

    private Boolean approved = false;
    private Boolean active = false;
    private Boolean archived = false;
    private LocalDateTime lastLogin;

    // 2FA Fields
    private String twoFactorCode;
    private LocalDateTime twoFactorExpiry;
    private String trustedDeviceId;

    // Profile
    private String profilePicture;
}