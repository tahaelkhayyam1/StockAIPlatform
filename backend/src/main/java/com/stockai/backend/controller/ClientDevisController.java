package com.stockai.backend.controller;

import com.stockai.backend.model.Client;
import com.stockai.backend.model.ClientDevis;
import com.stockai.backend.model.Piece;
import com.stockai.backend.repository.ClientDevisRepository;
import com.stockai.backend.repository.ClientRepository;
import com.stockai.backend.repository.PieceRepository;
import com.stockai.backend.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client-devis")
public class ClientDevisController {

    @Autowired
    private ClientDevisRepository clientDevisRepository;
    
    @Autowired
    private ClientRepository clientRepository;
    
    @Autowired
    private PieceRepository pieceRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public List<ClientDevis> getAllDevis() {
        return clientDevisRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ClientDevis createDevis(@RequestBody Map<String, Object> payload) {
        Long clientId = Long.valueOf(payload.get("clientId").toString());
        Long pieceId = Long.valueOf(payload.get("pieceId").toString());
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        Double estimatedPrice = payload.get("estimatedPrice") != null ? Double.valueOf(payload.get("estimatedPrice").toString()) : null;

        Client client = clientRepository.findById(clientId).orElseThrow();
        Piece piece = pieceRepository.findById(pieceId).orElseThrow();

        ClientDevis devis = new ClientDevis();
        devis.setClient(client);
        devis.setPiece(piece);
        devis.setQuantity(quantity);
        devis.setEstimatedPrice(estimatedPrice);
        devis.setStatus(ClientDevis.DevisStatus.DRAFT);

        auditService.logAction("CREATED CLIENT DEVIS", "Created quote for " + quantity + " " + piece.getName() + " for client " + client.getName());
        return clientDevisRepository.save(devis);
    }

    @PostMapping("/{id}/send")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ClientDevis sendDevis(@PathVariable Long id) {
        ClientDevis devis = clientDevisRepository.findById(id).orElseThrow();
        devis.setStatus(ClientDevis.DevisStatus.SENT);
        return clientDevisRepository.save(devis);
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ClientDevis acceptDevis(@PathVariable Long id) {
        ClientDevis devis = clientDevisRepository.findById(id).orElseThrow();
        devis.setStatus(ClientDevis.DevisStatus.ACCEPTED);
        return clientDevisRepository.save(devis);
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ClientDevis rejectDevis(@PathVariable Long id) {
        ClientDevis devis = clientDevisRepository.findById(id).orElseThrow();
        devis.setStatus(ClientDevis.DevisStatus.REJECTED);
        return clientDevisRepository.save(devis);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public void deleteDevis(@PathVariable Long id) {
        clientDevisRepository.deleteById(id);
    }
}
