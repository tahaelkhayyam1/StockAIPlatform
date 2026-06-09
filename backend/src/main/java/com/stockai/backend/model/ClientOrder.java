package com.stockai.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "client_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClientOrder {

    public enum OrderStatus {
        PENDING, APPROVED, SHIPPED, DELIVERED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "piece_id")
    private Piece piece;

    @Column(nullable = false)
    private Integer quantity;

    private Double price;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    private LocalDateTime orderDate = LocalDateTime.now();
}
