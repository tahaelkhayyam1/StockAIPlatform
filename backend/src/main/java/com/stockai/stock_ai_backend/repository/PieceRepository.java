package com.stockai.stock_ai_backend.repository;

import com.stockai.stock_ai_backend.model.Piece;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PieceRepository extends JpaRepository<Piece, Long> {

}
