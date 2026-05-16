package com.stockai.backend.controller;

import com.stockai.backend.dto.AdvancedKpiDTO;
import com.stockai.backend.dto.DashboardKpiDTO;
import com.stockai.backend.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/kpis")
    public DashboardKpiDTO getKpis() {
        return dashboardService.getKpis();
    }

    @GetMapping("/advanced-kpis")
    public AdvancedKpiDTO getAdvancedKpis() {
        return dashboardService.getAdvancedKpis();
    }
}