package com.stockai.backend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StockStatusDTO {

    private Long pieceId;
    private String reference;
    private String name;

    private int currentStock;
    private int minimumStock;

    private boolean lowStock;
}