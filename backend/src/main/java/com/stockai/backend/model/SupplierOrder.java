package com.stockai.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierOrder {

    public enum OrderStatus {
        DEVIS_REQUESTED, DEVIS_RECEIVED, ORDER_SENT, RECEIVED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Piece piece;

    @ManyToOne
    private Supplier supplier;

    private int quantity;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.DEVIS_REQUESTED;

    private LocalDateTime orderDate;
    private LocalDateTime receivedDate;

    // Optional tracking info
    private String trackingNumber;
}
