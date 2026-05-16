package com.stockai.backend.model;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Piece {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String reference;

    private String name;

    private String category;

    private String criticality; // LOW / MEDIUM / HIGH

    private int minimumStock;

    @OneToMany(mappedBy = "piece")
    private List<StockMovement> movements;
}