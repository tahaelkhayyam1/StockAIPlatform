package com.stockai.backend.repository;

import com.stockai.backend.model.ConsumptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsumptionHistoryRepository extends JpaRepository<ConsumptionHistory, Long> {
}