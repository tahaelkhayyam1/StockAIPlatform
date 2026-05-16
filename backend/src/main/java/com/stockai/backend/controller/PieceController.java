package com.stockai.backend.controller;

import com.stockai.backend.model.Piece;
import com.stockai.backend.repository.PieceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pieces")
public class PieceController {

    @Autowired
    private PieceRepository repo;

    @PostMapping
    public Piece create(@RequestBody Piece piece) {
        return repo.save(piece);
    }

    @GetMapping
    public List<Piece> getAll() {
        return repo.findAll();
    }
}