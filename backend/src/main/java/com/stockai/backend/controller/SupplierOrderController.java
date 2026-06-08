package com.stockai.backend.controller;

import com.stockai.backend.model.SupplierOrder;
import com.stockai.backend.model.Piece;
import com.stockai.backend.model.Supplier;
import com.stockai.backend.repository.SupplierOrderRepository;
import com.stockai.backend.repository.PieceRepository;
import com.stockai.backend.repository.SupplierRepository;
import com.stockai.backend.service.StockService;
import com.stockai.backend.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class SupplierOrderController {

    @Autowired
    private SupplierOrderRepository orderRepository;

    @Autowired
    private PieceRepository pieceRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private StockService stockService;

    @Autowired
    private AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<SupplierOrder> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public SupplierOrder createOrder(@RequestBody SupplierOrder order) {
        
        Piece piece = pieceRepository.findById(order.getPiece().getId())
                .orElseThrow(() -> new RuntimeException("Piece not found"));
        Supplier supplier = supplierRepository.findById(order.getSupplier().getId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        order.setPiece(piece);
        order.setSupplier(supplier);
        order.setOrderDate(LocalDateTime.now());
        
        if (order.getStatus() == null) {
            order.setStatus(SupplierOrder.OrderStatus.DEVIS_REQUESTED);
        }

        SupplierOrder saved = orderRepository.save(order);

        auditService.logAction("ORDER_CREATED", "Created PO for " + order.getQuantity() + "x " + piece.getName() + " from " + supplier.getName());

        return saved;
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public SupplierOrder updateStatus(@PathVariable Long id, @RequestParam SupplierOrder.OrderStatus status) {
        SupplierOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // If transitioning to RECEIVED, increment stock!
        if (order.getStatus() != SupplierOrder.OrderStatus.RECEIVED && status == SupplierOrder.OrderStatus.RECEIVED) {
            order.setReceivedDate(LocalDateTime.now());
            stockService.addStock(order.getPiece().getId(), order.getQuantity());
            auditService.logAction("ORDER_RECEIVED", "Received PO #" + id + ", added " + order.getQuantity() + " to stock.");
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }
}
