package com.stockai.backend.controller;
import java.util.*;
import com.stockai.backend.model.Supplier;
import com.stockai.backend.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierRepository supplierRepo;

    @PostMapping
    public Supplier create(@RequestBody Supplier supplier) {
        return supplierRepo.save(supplier);
    }

    @GetMapping
    public List<Supplier> getAll() {
        return supplierRepo.findAll();
    }
}