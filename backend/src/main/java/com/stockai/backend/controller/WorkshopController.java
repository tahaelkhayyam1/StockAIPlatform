package com.stockai.backend.controller;

import com.stockai.backend.model.Workshop;
import com.stockai.backend.repository.WorkshopRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workshops")
public class WorkshopController {

    private final WorkshopRepository repository;

    public WorkshopController(WorkshopRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Workshop> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Workshop create(@RequestBody Workshop workshop) {
        return repository.save(workshop);
    }
}
