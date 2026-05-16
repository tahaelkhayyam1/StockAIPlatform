package com.stockai.stock_ai_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Piece piece;

    private String type; // ENTRY / EXIT / ADJUSTMENT

    private int quantity;

    private LocalDateTime date;

    private String source; // SUPPLIER / WORKSHOP / MANUAL
}