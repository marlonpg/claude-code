package com.vetledger.dtos;

import java.math.BigDecimal;

/**
 * DTO for dashboard aggregation response.
 */
public class DashboardDTO {

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal totalProfit;
    private long pendingServicesCount;
    private long completedServicesCount;

    // Fields for date range filtering
    private Integer year;
    private Integer month; // 1-12

    public DashboardDTO() {}

    public DashboardDTO(BigDecimal totalIncome, BigDecimal totalExpenses,
                       BigDecimal totalProfit, long pendingServicesCount,
                       long completedServicesCount) {
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.totalProfit = totalProfit;
        this.pendingServicesCount = pendingServicesCount;
        this.completedServicesCount = completedServicesCount;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getTotalProfit() {
        return totalProfit;
    }

    public void setTotalProfit(BigDecimal totalProfit) {
        this.totalProfit = totalProfit;
    }

    public long getPendingServicesCount() {
        return pendingServicesCount;
    }

    public void setPendingServicesCount(long pendingServicesCount) {
        this.pendingServicesCount = pendingServicesCount;
    }

    public long getCompletedServicesCount() {
        return completedServicesCount;
    }

    public void setCompletedServicesCount(long completedServicesCount) {
        this.completedServicesCount = completedServicesCount;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }
}
