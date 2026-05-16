package com.stockai.stock_ai_backend.repository;

import com.stockai.stock_ai_backend.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
}
