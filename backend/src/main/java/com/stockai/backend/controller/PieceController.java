package com.stockai.backend.controller;

import com.stockai.backend.model.Piece;
import com.stockai.backend.model.User;
import com.stockai.backend.repository.PieceRepository;
import com.stockai.backend.repository.UserRepository;
import com.stockai.backend.service.AuditService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pieces")
public class PieceController {

    private final PieceRepository pieceRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public PieceController(PieceRepository pieceRepository,
                           UserRepository userRepository,
                           AuditService auditService) {
        this.pieceRepository = pieceRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    // CREATE PIECE (linked to logged-in user)
    @PostMapping
    public Piece create(@RequestBody Piece piece,
                        Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        piece.setOwner(user);

        Piece saved = pieceRepository.save(piece);
        auditService.logAction("CREATED PIECE", saved.getName());
        return saved;
    }

    // GET ALL PIECES (GLOBAL - admin view later)
    @GetMapping
    public List<Piece> getAll() {
        return pieceRepository.findAll();
    }

    // UPDATE PIECE
    @PutMapping("/{id}")
    public Piece update(@PathVariable Long id,
                        @RequestBody Piece updatedPiece) {

        Piece piece = pieceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Piece not found"));

        piece.setName(updatedPiece.getName());
        piece.setReference(updatedPiece.getReference());
        piece.setCategory(updatedPiece.getCategory());
        piece.setCriticality(updatedPiece.getCriticality());
        piece.setMinimumStock(updatedPiece.getMinimumStock());

        Piece saved = pieceRepository.save(piece);
        auditService.logAction("UPDATED PIECE", saved.getName());
        return saved;
    }

    // DELETE PIECE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Piece piece = pieceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Piece not found"));
        pieceRepository.deleteById(id);
        auditService.logAction("DELETED PIECE", piece.getName());
    }
}