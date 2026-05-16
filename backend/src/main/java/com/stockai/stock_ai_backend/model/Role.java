package com.stockai.stock_ai_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // ADMIN, MANAGER, WORKSHOP, BUYER
}