package com.stockai.backend.service;

import com.stockai.backend.dto.AdvancedKpiDTO;
import com.stockai.backend.dto.DashboardKpiDTO;
import com.stockai.backend.model.Piece;
import com.stockai.backend.model.SupplierPart;
import com.stockai.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final PieceRepository pieceRepo;
    private final StockMovementRepository movementRepo;
    private final StockService stockService;
    private final SupplierPartRepository supplierPartRepo;
    public DashboardService(PieceRepository pieceRepo,
                            StockMovementRepository movementRepo,
                            StockService stockService,
                            SupplierPartRepository supplierPartRepo) {
        this.pieceRepo = pieceRepo;
        this.movementRepo = movementRepo;
        this.stockService = stockService;
        this.supplierPartRepo = supplierPartRepo;
    }

    public DashboardKpiDTO getKpis() {

        int totalPieces = pieceRepo.findAll().size();

        int lowStockCount = (int) pieceRepo.findAll()
                .stream()
                .filter(p -> stockService.getStockStatus(p.getId()).isLowStock())
                .count();

        int totalMovements = movementRepo.findAll().size();

        return new DashboardKpiDTO(
                totalPieces,
                lowStockCount,
                totalMovements
        );
    }



    public AdvancedKpiDTO getAdvancedKpis() {

        List<Piece> pieces = pieceRepo.findAll();

        // 1. Stock value (simple estimation)
        double totalStockValue = pieces.stream()
                .mapToDouble(p -> {
                    int stock = stockService.getStock(p.getId());
                    double avgPrice = supplierPartRepo
                            .findByPieceIdOrderByPriceAsc(p.getId())
                            .stream()
                            .mapToDouble(SupplierPart::getPrice)
                            .min()
                            .orElse(0);

                    return stock * avgPrice;
                })
                .sum();

        //  2. Top consumed (based on stock movement exits)
        List<String> topConsumed = pieces.stream()
                .sorted((a, b) -> {
                    int aUsage = getTotalConsumption(a.getId());
                    int bUsage = getTotalConsumption(b.getId());
                    return Integer.compare(bUsage, aUsage);
                })
                .limit(5)
                .map(Piece::getName)
                .toList();

        // ⚠️ 3. Critical pieces (low stock + high usage)
        List<String> critical = pieces.stream()
                .filter(p -> {
                    int stock = stockService.getStock(p.getId());
                    int usage = getTotalConsumption(p.getId());
                    return stock < p.getMinimumStock() && usage > 5;
                })
                .map(Piece::getName)
                .toList();

        return new AdvancedKpiDTO(
                totalStockValue,
                topConsumed,
                critical
        );
    }


    private int getTotalConsumption(Long pieceId) {

        return movementRepo.findAll()
                .stream()
                .filter(m -> m.getPiece().getId().equals(pieceId))
                .mapToInt(m -> m.getType().equals("EXIT") ? m.getQuantity() : 0)
                .sum();
    }
}