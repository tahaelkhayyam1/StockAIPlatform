package com.stockai.backend.service;

import com.stockai.backend.model.StockMovement;
import com.stockai.backend.repository.StockMovementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockCalculatorService {

    private final StockMovementRepository movementRepo;

    public StockCalculatorService(StockMovementRepository movementRepo) {
        this.movementRepo = movementRepo;
    }

    public int calculateStock(Long pieceId) {
        return movementRepo.calculateStockByPieceId(pieceId);
    }
}