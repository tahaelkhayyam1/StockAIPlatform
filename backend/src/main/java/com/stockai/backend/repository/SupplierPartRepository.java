package com.stockai.backend.repository;

import com.stockai.backend.model.SupplierPart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierPartRepository extends JpaRepository<SupplierPart, Long> {

    List<SupplierPart> findByPieceIdOrderByPriceAsc(Long pieceId);

}