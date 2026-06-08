package com.stockai.backend.controller;

import com.stockai.backend.model.StockMovement;
import com.stockai.backend.repository.StockMovementRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementRepository repository;

    public StockMovementController(StockMovementRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Page<StockMovement> getMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return repository.findAll(pageable);
    }
}
