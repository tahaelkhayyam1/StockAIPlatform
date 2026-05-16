package com.stockai.backend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReorderRecommendationDTO {

    private Long pieceId;
    private String reference;
    private String name;

    private int currentStock;
    private int minimumStock;

    private int recommendedQuantity;

    private String bestSupplierName;

    private String reason;
}