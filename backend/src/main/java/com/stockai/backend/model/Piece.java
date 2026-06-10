package com.stockai.backend.model;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Piece {
    @ManyToOne
    private User owner;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String reference;

    private String name;

    private String category;

    private String criticality; // LOW / MEDIUM / HIGH

    private Integer minimumStock;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    private String barcode;

    @org.hibernate.annotations.Formula("(SELECT COALESCE(SUM(CASE WHEN m.type = 'ENTRY' THEN m.quantity ELSE -m.quantity END), 0) FROM stock_movement m WHERE m.piece_id = id)")
    private Integer currentStock;

    @OneToMany(mappedBy = "piece")
    @JsonIgnore
    private List<StockMovement> movements;
}