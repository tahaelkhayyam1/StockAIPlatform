package com.stockai.backend.controller;

import com.stockai.backend.dto.ReorderRecommendationDTO;
import com.stockai.backend.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private StockService stockService;

    @GetMapping("/reorder")
    public List<ReorderRecommendationDTO> getRecommendations() {
        return stockService.getReorderRecommendations();
    }
}