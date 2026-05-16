package com.stockai.backend.controller;


import com.stockai.backend.service.ConsumptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consumption")
public class ConsumptionController {

    @Autowired
    private ConsumptionService service;

    @PostMapping
    public void consume(@RequestParam Long pieceId,
                        @RequestParam Long workshopId,
                        @RequestParam int quantity) {
        service.consume(pieceId, workshopId, quantity);
    }
}