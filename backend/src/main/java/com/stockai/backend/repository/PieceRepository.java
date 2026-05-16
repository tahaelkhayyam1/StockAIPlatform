package com.stockai.backend.repository;

import com.stockai.backend.model.Piece;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PieceRepository extends JpaRepository<Piece, Long> {

}
