package com.stockai.backend.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdvancedKpiDTO {

    private double totalStockValue;

    private List<String> topConsumedPieces;

    private List<String> criticalPieces;
}