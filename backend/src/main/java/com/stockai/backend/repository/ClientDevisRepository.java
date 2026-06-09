package com.stockai.backend.repository;

import com.stockai.backend.model.ClientDevis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientDevisRepository extends JpaRepository<ClientDevis, Long> {
    List<ClientDevis> findByClientId(Long clientId);
    List<ClientDevis> findByStatus(ClientDevis.DevisStatus status);
}
