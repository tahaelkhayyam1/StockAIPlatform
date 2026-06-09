package com.stockai.backend.controller;

import com.stockai.backend.model.Client;
import com.stockai.backend.model.ClientOrder;
import com.stockai.backend.model.Piece;
import com.stockai.backend.repository.ClientOrderRepository;
import com.stockai.backend.repository.ClientRepository;
import com.stockai.backend.repository.PieceRepository;
import com.stockai.backend.service.AuditService;
import com.stockai.backend.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client-orders")
public class ClientOrderController {

    @Autowired
    private ClientOrderRepository clientOrderRepository;
    
    @Autowired
    private ClientRepository clientRepository;
    
    @Autowired
    private PieceRepository pieceRepository;

    @Autowired
    private StockService stockService;

    @Autowired
    private AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public List<ClientOrder> getAllOrders() {
        return clientOrderRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ClientOrder createOrder(@RequestBody Map<String, Object> payload) {
        Long clientId = Long.valueOf(payload.get("clientId").toString());
        Long pieceId = Long.valueOf(payload.get("pieceId").toString());
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        Double price = payload.get("price") != null ? Double.valueOf(payload.get("price").toString()) : null;

        Client client = clientRepository.findById(clientId).orElseThrow();
        Piece piece = pieceRepository.findById(pieceId).orElseThrow();

        ClientOrder order = new ClientOrder();
        order.setClient(client);
        order.setPiece(piece);
        order.setQuantity(quantity);
        order.setPrice(price);
        order.setStatus(ClientOrder.OrderStatus.PENDING);

        auditService.logAction("CREATED CLIENT ORDER", "Created order for " + quantity + " " + piece.getName() + " for client " + client.getName());
        return clientOrderRepository.save(order);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ClientOrder approveOrder(@PathVariable Long id) {
        ClientOrder order = clientOrderRepository.findById(id).orElseThrow();
        if (order.getStatus() != ClientOrder.OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be approved");
        }
        
        // Deduct stock!
        stockService.removeStock(order.getPiece().getId(), order.getQuantity());

        order.setStatus(ClientOrder.OrderStatus.APPROVED);
        auditService.logAction("APPROVED CLIENT ORDER", "Approved client order #" + id + " for " + order.getQuantity() + " " + order.getPiece().getName());
        
        return clientOrderRepository.save(order);
    }

    @PostMapping("/{id}/ship")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ClientOrder shipOrder(@PathVariable Long id) {
        ClientOrder order = clientOrderRepository.findById(id).orElseThrow();
        order.setStatus(ClientOrder.OrderStatus.SHIPPED);
        return clientOrderRepository.save(order);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ClientOrder cancelOrder(@PathVariable Long id) {
        ClientOrder order = clientOrderRepository.findById(id).orElseThrow();
        order.setStatus(ClientOrder.OrderStatus.CANCELLED);
        return clientOrderRepository.save(order);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public void deleteOrder(@PathVariable Long id) {
        clientOrderRepository.deleteById(id);
    }
}
