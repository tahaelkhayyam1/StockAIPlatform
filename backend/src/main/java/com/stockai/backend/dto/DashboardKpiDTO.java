package com.stockai.backend.dto;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DashboardKpiDTO {

    private int totalPieces;
    private int lowStockCount;
    private int totalStockMovements;
}