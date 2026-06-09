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
        piece.setDescription(updatedPiece.getDescription());
        piece.setImageUrl(updatedPiece.getImageUrl());
        piece.setBarcode(updatedPiece.getBarcode());

        Piece saved = pieceRepository.save(piece);
        auditService.logAction("UPDATED PIECE", saved.getName());
        return saved;
    }

    // DELETE PIECE
    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public void delete(@PathVariable Long id) {
        Piece piece = pieceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Piece not found"));
        pieceRepository.deleteById(id);
        auditService.logAction("DELETED PIECE", piece.getName());
    }

    @PostMapping("/{id}/image")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public Piece uploadImage(@PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file, jakarta.servlet.http.HttpServletRequest request) {
        Piece piece = pieceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Piece not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file");
        }

        try {
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads").toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(uploadDir);

            // Generate unique filename
            String fileName = id + "_" + System.currentTimeMillis() + "_" + org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
            java.nio.file.Path targetLocation = uploadDir.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Generate URL
            String baseUrl = String.format("%s://%s:%d", request.getScheme(), request.getServerName(), request.getServerPort());
            String imageUrl = baseUrl + "/api/images/" + fileName;

            piece.setImageUrl(imageUrl);
            Piece saved = pieceRepository.save(piece);
            auditService.logAction("UPLOADED IMAGE", "Uploaded new image for piece: " + piece.getName());
            return saved;
        } catch (java.io.IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
        }
    }
}