package com.stockai.backend.service;

import com.stockai.backend.model.ConsumptionHistory;
import com.stockai.backend.model.Piece;
import com.stockai.backend.model.StockMovement;
import com.stockai.backend.model.Workshop;
import com.stockai.backend.repository.ConsumptionHistoryRepository;
import com.stockai.backend.repository.PieceRepository;
import com.stockai.backend.repository.StockMovementRepository;
import com.stockai.backend.repository.WorkshopRepository;
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ConsumptionService {

    @Autowired
    private StockMovementRepository movementRepo;

    @Autowired
    private ConsumptionHistoryRepository historyRepo;

    @Autowired
    private PieceRepository pieceRepo;

    @Autowired
    private WorkshopRepository workshopRepo;
    public void consume(Long pieceId, Long workshopId, int quantity) {

        Piece piece = pieceRepo.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Piece not found"));

        Workshop workshop = workshopRepo.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Workshop not found"));

        // 1. Save stock movement
        StockMovement movement = new StockMovement();
        movement.setPiece(piece);
        movement.setType("EXIT");
        movement.setQuantity(quantity);
        movement.setDate(LocalDateTime.now());
        movement.setSource("WORKSHOP");

        movementRepo.save(movement);

        // 2. Save consumption history (for AI)
        ConsumptionHistory history = new ConsumptionHistory();
        history.setPiece(piece);
        history.setWorkshop(workshop);
        history.setQuantity(quantity);
        history.setDate(LocalDateTime.now());

        historyRepo.save(history);
    }
}