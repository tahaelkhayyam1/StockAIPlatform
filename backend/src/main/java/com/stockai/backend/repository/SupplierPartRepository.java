package com.stockai.backend.repository;

import com.stockai.backend.model.SupplierPart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierPartRepository extends JpaRepository<SupplierPart, Long> {
}