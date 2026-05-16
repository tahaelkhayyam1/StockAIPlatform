package com.stockai.backend.controller;

import com.stockai.backend.model.SupplierPart;
import com.stockai.backend.repository.SupplierPartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-parts")
public class SupplierPartController {

    @Autowired
    private SupplierPartRepository repo;

    @PostMapping
    public SupplierPart create(@RequestBody SupplierPart supplierPart) {
        return repo.save(supplierPart);
    }

    @GetMapping
    public List<SupplierPart> getAll() {
        return repo.findAll();
    }
}