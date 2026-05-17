package com.stockai.backend.repository;

import com.stockai.backend.model.ConsumptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConsumptionHistoryRepository extends JpaRepository<ConsumptionHistory, Long> {
    @Query("SELECT COALESCE(SUM(c.quantity), 0) " +
            "FROM ConsumptionHistory c WHERE c.piece.id = :pieceId")
    int totalConsumptionByPiece(@Param("pieceId") Long pieceId);
}