package com.stockai.backend.repository;

import com.stockai.backend.model.ClientOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientOrderRepository extends JpaRepository<ClientOrder, Long> {
    List<ClientOrder> findByClientId(Long clientId);
    List<ClientOrder> findByStatus(ClientOrder.OrderStatus status);
}
