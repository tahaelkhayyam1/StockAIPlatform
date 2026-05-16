package com.stockai.backend.service;

import com.stockai.backend.dto.ReorderRecommendationDTO;
import com.stockai.backend.dto.StockStatusDTO;
import com.stockai.backend.model.*;
import com.stockai.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockService {

    private final StockMovementRepository movementRepo;
    private final PieceRepository pieceRepo;
    private final SupplierPartRepository supplierPartRepo;
    private final StockCalculatorService stockCalculatorService;
    public StockService(StockMovementRepository movementRepo,
                        PieceRepository pieceRepo ,SupplierPartRepository supplierPartRepo,StockCalculatorService stockCalculatorService ) {
        this.movementRepo = movementRepo;
        this.pieceRepo = pieceRepo;
        this.supplierPartRepo=supplierPartRepo;
        this.stockCalculatorService=stockCalculatorService;
    }

    public StockMovement addStock(Long pieceId, int quantity) {

        Piece piece = pieceRepo.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Piece not found"));

        StockMovement movement = new StockMovement();
        movement.setPiece(piece);
        movement.setType("ENTRY");
        movement.setQuantity(quantity);
        movement.setDate(LocalDateTime.now());
        movement.setSource("SUPPLIER");

        return movementRepo.save(movement);
    }

    public StockMovement removeStock(Long pieceId, int quantity) {

        Piece piece = pieceRepo.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Piece not found"));

        int currentStock = getStock(pieceId);

        if (currentStock < quantity) {
            throw new RuntimeException("Not enough stock available");
        }

        StockMovement movement = new StockMovement();
        movement.setPiece(piece);
        movement.setType("EXIT");
        movement.setQuantity(quantity);
        movement.setDate(LocalDateTime.now());
        movement.setSource("WORKSHOP");

        return movementRepo.save(movement);
    }

    public int getStock(Long pieceId) {
        return stockCalculatorService.calculateStock(pieceId);
    }



    public StockStatusDTO getStockStatus(Long pieceId) {

        Piece piece = pieceRepo.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Piece not found"));

        int stock = getStock(pieceId);

        boolean lowStock = stock < piece.getMinimumStock();

        return new StockStatusDTO(
                piece.getId(),
                piece.getReference(),
                piece.getName(),
                stock,
                piece.getMinimumStock(),
                lowStock
        );
    }


    public List<StockStatusDTO> getLowStockPieces() {

        List<Piece> pieces = pieceRepo.findAll();

        return pieces.stream()
                .map(p -> getStockStatus(p.getId()))
                .filter(StockStatusDTO::isLowStock)
                .toList();
    }





    public List<ReorderRecommendationDTO> getReorderRecommendations() {

        List<Piece> pieces = pieceRepo.findAll();

        List<ReorderRecommendationDTO> result = new ArrayList<>();

        for (Piece p : pieces) {

            int stock = getStock(p.getId());

            if (stock <= p.getMinimumStock()) {

                SupplierPart best = supplierPartRepo
                        .findByPieceIdOrderByPriceAsc(p.getId())
                        .stream()
                        .findFirst()
                        .orElse(null);

                String supplierName = (best != null)
                        ? best.getSupplier().getName()
                        : "N/A";

                int recommendedQty = p.getMinimumStock() * 2;

                result.add(new ReorderRecommendationDTO(
                        p.getId(),
                        p.getReference(),
                        p.getName(),
                        stock,
                        p.getMinimumStock(),
                        recommendedQty,
                        supplierName,
                        "Low stock detected"
                ));
            }
        }

        return result;
    }





}