package com.stockai.backend.controller;

import com.stockai.backend.model.Piece;
import com.stockai.backend.model.User;
import com.stockai.backend.model.WorkshopRequest;
import com.stockai.backend.repository.PieceRepository;
import com.stockai.backend.repository.UserRepository;
import com.stockai.backend.repository.WorkshopRequestRepository;
import com.stockai.backend.service.AuditService;
import com.stockai.backend.service.StockService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class WorkshopRequestController {

    private final WorkshopRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final PieceRepository pieceRepository;
    private final StockService stockService;
    private final AuditService auditService;
    private final com.stockai.backend.service.NotificationService notificationService;

    public WorkshopRequestController(WorkshopRequestRepository requestRepository,
                                     UserRepository userRepository,
                                     PieceRepository pieceRepository,
                                     StockService stockService,
                                     AuditService auditService,
                                     com.stockai.backend.service.NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.pieceRepository = pieceRepository;
        this.stockService = stockService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('WORKSHOP')")
    public WorkshopRequest createRequest(@RequestParam Long pieceId, @RequestParam int quantity, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Piece piece = pieceRepository.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Piece not found"));

        WorkshopRequest request = new WorkshopRequest();
        request.setPiece(piece);
        request.setRequestedBy(user);
        request.setQuantity(quantity);
        request.setStatus(WorkshopRequest.RequestStatus.PENDING);
        request.setRequestDate(LocalDateTime.now());

        WorkshopRequest saved = requestRepository.save(request);

        auditService.logAction("REQUESTED PART", "User requested " + quantity + " of " + piece.getName());
        notificationService.notifyRole(com.stockai.backend.model.Role.ADMIN, "Workshop User " + user.getUsername() + " requested " + quantity + "x " + piece.getName());

        return saved;
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('WORKSHOP')")
    public List<WorkshopRequest> getMyRequests(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepository.findByRequestedBy_Id(user.getId());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public List<WorkshopRequest> getPendingRequests() {
        return requestRepository.findByStatus(WorkshopRequest.RequestStatus.PENDING);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public WorkshopRequest approveRequest(@PathVariable Long id) {
        WorkshopRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != WorkshopRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved");
        }

        request.setStatus(WorkshopRequest.RequestStatus.APPROVED);
        WorkshopRequest saved = requestRepository.save(request);

        // Deduct stock!
        stockService.removeStock(request.getPiece().getId(), request.getQuantity());

        auditService.logAction("APPROVED REQUEST", "Approved request #" + id + " for " + request.getQuantity() + " " + request.getPiece().getName());
        notificationService.notifyUser(request.getRequestedBy(), "Your request for " + request.getPiece().getName() + " was APPROVED.");

        return saved;
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public WorkshopRequest rejectRequest(@PathVariable Long id) {
        WorkshopRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != WorkshopRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected");
        }

        request.setStatus(WorkshopRequest.RequestStatus.REJECTED);
        WorkshopRequest saved = requestRepository.save(request);

        auditService.logAction("REJECTED REQUEST", "Rejected request #" + id + " for " + request.getPiece().getName());
        notificationService.notifyUser(request.getRequestedBy(), "Your request for " + request.getPiece().getName() + " was REJECTED.");

        return saved;
    }
}
