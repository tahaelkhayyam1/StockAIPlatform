package com.stockai.backend.controller;

import com.stockai.backend.model.StockMovement;
import com.stockai.backend.service.StockService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping("/entry")
    public StockMovement add(@RequestParam Long pieceId,
                             @RequestParam int quantity) {
        return stockService.addStock(pieceId, quantity);
    }

    @PostMapping("/exit")
    public StockMovement remove(@RequestParam Long pieceId,
                                @RequestParam int quantity) {
        return stockService.removeStock(pieceId, quantity);
    }

    @GetMapping("/{pieceId}")
    public int getStock(@PathVariable Long pieceId) {
        return stockService.getStock(pieceId);
    }
}