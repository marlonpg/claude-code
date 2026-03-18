package com.vetledger.controllers;

import com.vetledger.dtos.DashboardDTO;
import com.vetledger.entities.ServiceStatus;
import com.vetledger.repositories.DashboardRepository;
import com.vetledger.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Controller for dashboard aggregation endpoints.
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DashboardRepository dashboardRepository;

    /**
     * Get dashboard summary for current month.
     * @return DashboardDTO with aggregated data for current month
     */
    @GetMapping("/current")
    public ResponseEntity<DashboardDTO> getDashboardCurrent() {
        DashboardDTO dashboard = dashboardService.getDashboardForCurrentMonth();
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get dashboard summary for a specific month.
     * @param year Year (1-9999)
     * @param month Month (1-12)
     * @return DashboardDTO with aggregated data for specified month
     */
    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboardByMonth(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        DashboardDTO dashboard = dashboardService.getDashboardByMonth(year, month);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get dashboard summary for a specific date range.
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return DashboardDTO with aggregated data for date range
     */
    @GetMapping("/range")
    public ResponseEntity<DashboardDTO> getDashboardByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        DashboardDTO dashboard = dashboardService.getDashboardByDateRange(startDate, endDate);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get pending services count for current month only.
     * @return Long count of pending services
     */
    @GetMapping("/stats/pending")
    public ResponseEntity<Long> getPendingCountCurrent() {
        long count = dashboardRepository.getPendingCountForCurrentMonth(ServiceStatus.PENDING);
        return ResponseEntity.ok(count);
    }

    /**
     * Get completed services count for current month only.
     * @return Long count of completed services
     */
    @GetMapping("/stats/completed")
    public ResponseEntity<Long> getCompletedCountCurrent() {
        long count = dashboardRepository.getCompletedCountForCurrentMonth(ServiceStatus.COMPLETED);
        return ResponseEntity.ok(count);
    }
}
