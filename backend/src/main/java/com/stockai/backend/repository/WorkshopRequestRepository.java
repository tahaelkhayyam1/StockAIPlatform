package com.stockai.backend.repository;

import com.stockai.backend.model.WorkshopRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkshopRequestRepository extends JpaRepository<WorkshopRequest, Long> {
    List<WorkshopRequest> findByRequestedBy_Id(Long userId);
    List<WorkshopRequest> findByStatus(WorkshopRequest.RequestStatus status);
}
