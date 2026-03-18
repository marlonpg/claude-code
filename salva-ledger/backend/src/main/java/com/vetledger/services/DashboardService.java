package com.vetledger.services;

import com.vetledger.dtos.DashboardDTO;
import com.vetledger.entities.ServiceStatus;
import com.vetledger.entities.Expense;
import com.vetledger.repositories.DashboardRepository;
import com.vetledger.repositories.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Service for dashboard aggregation and statistics.
 */
@Service
public class DashboardService {

    @Autowired
    private DashboardRepository dashboardRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    /**
     * Get dashboard summary for a specific month.
     * @param year Year (1-9999)
     * @param month Month (1-12)
     * @return DashboardDTO with aggregated data
     */
    public DashboardDTO getDashboardByMonth(Integer year, Integer month) {
        if (year == null || month == null || month < 1 || month > 12) {
            throw new IllegalArgumentException("Invalid year or month");
        }

        // Calculate service-related metrics for the specified month
        BigDecimal totalIncome = dashboardRepository.getTotalIncomeByMonth(year, month);
        BigDecimal totalProfit = dashboardRepository.getTotalProfitByMonth(year, month);

        // Calculate total expenses (vetCost + driverCost + extraCost from services)
        // We need to sum costs for the same month
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = LocalDate.of(year, month + 1, 1);
        BigDecimal totalCosts = dashboardRepository.getTotalCostsByDateRange(startDate, endDate);
        BigDecimal totalExpenses = totalCosts; // Costs from services

        // Add standalone expenses for the month
        BigDecimal standaloneExpenses = getStandaloneExpensesByMonth(year, month);
        totalExpenses = totalExpenses.add(standaloneExpenses);

        // Calculate net profit = totalIncome - totalExpenses
        // But we already have netProfit from the database, so use that
        totalProfit = totalProfit != null ? totalProfit : BigDecimal.ZERO;
        totalIncome = totalIncome != null ? totalIncome : BigDecimal.ZERO;

        // Get service counts by status
        long pendingCount = dashboardRepository.getPendingServicesCount(ServiceStatus.PENDING);
        long completedCount = dashboardRepository.getCompletedServicesCount(ServiceStatus.COMPLETED);

        return new DashboardDTO(totalIncome, totalExpenses, totalProfit, pendingCount, completedCount);
    }

    /**
     * Get dashboard summary for a specific date range.
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return DashboardDTO with aggregated data
     */
    public DashboardDTO getDashboardByDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Invalid date range");
        }

        // Calculate income and costs for the date range
        BigDecimal totalIncome = dashboardRepository.getTotalIncomeByDateRange(startDate, endDate);
        BigDecimal totalCosts = dashboardRepository.getTotalCostsByDateRange(startDate, endDate);
        BigDecimal totalProfit = dashboardRepository.getTotalProfitByDateRange(startDate, endDate);

        // Add standalone expenses for the date range
        BigDecimal standaloneExpenses = getStandaloneExpensesByDateRange(startDate, endDate);
        totalCosts = totalCosts.add(standaloneExpenses);

        // If we're calculating totalCosts, update profit accordingly
        // netProfit = totalIncome - totalCosts
        if (totalCosts != null && totalIncome != null) {
            totalProfit = totalIncome.subtract(totalCosts);
        }

        // Get service counts by status for the date range
        long pendingCount = dashboardRepository.getServiceCountByStatusAndDateRange(
                startDate, endDate, ServiceStatus.PENDING);
        long completedCount = dashboardRepository.getServiceCountByStatusAndDateRange(
                startDate, endDate, ServiceStatus.COMPLETED);

        return new DashboardDTO(totalIncome, totalCosts, totalProfit, pendingCount, completedCount);
    }

    /**
     * Get dashboard summary for current month.
     * @return DashboardDTO with aggregated data for current month
     */
    public DashboardDTO getDashboardForCurrentMonth() {
        LocalDate now = LocalDate.now();
        return getDashboardByMonth(now.getYear(), now.getMonthValue());
    }

    /**
     * Get standalone (non-service) expenses for a month.
     */
    private BigDecimal getStandaloneExpensesByMonth(Integer year, Integer month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = LocalDate.of(year, month + 1, 1);
        return getStandaloneExpensesByDateRange(startDate, endDate);
    }

    /**
     * Get standalone (non-service) expenses for a date range.
     */
    private BigDecimal getStandaloneExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        try {
            // Sum amounts for expenses within the date range
            return expenseRepository.findByDateBetween(startDate, endDate)
                    .stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    /**
     * Get total income for a specific date.
     */
    public BigDecimal getIncomeByDate(LocalDate date) {
        try {
            return dashboardRepository.getTotalIncomeByDateRange(
                    LocalDate.of(date.getYear(), date.getMonthValue(), 1),
                    LocalDate.of(date.getYear(), date.getMonthValue(), date.getDayOfMonth()));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
