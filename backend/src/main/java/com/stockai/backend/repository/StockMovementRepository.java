package com.stockai.backend.repository;

import com.stockai.backend.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    @Query("SELECT COALESCE(SUM(CASE WHEN m.type = 'ENTRY' THEN m.quantity ELSE -m.quantity END), 0) " +
            "FROM StockMovement m WHERE m.piece.id = :pieceId")
    int calculateStockByPieceId(@Param("pieceId") Long pieceId);

}
