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

        List<StockMovement> movements = movementRepo.findAll();

        return movements.stream()
                .filter(m -> m.getPiece().getId().equals(pieceId))
                .mapToInt(m -> m.getType().equals("ENTRY")
                        ? m.getQuantity()
                        : -m.getQuantity())
                .sum();
    }
}