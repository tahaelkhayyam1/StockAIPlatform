package com.stockai.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "client_devis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClientDevis {

    public enum DevisStatus {
        DRAFT, SENT, ACCEPTED, REJECTED
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

    private Double estimatedPrice;

    @Enumerated(EnumType.STRING)
    private DevisStatus status = DevisStatus.DRAFT;

    private LocalDateTime devisDate = LocalDateTime.now();
}
