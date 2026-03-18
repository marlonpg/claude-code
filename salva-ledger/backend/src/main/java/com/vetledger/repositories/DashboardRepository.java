package com.vetledger.repositories;

import com.vetledger.entities.Service;
import com.vetledger.entities.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Repository for dashboard aggregation queries.
 */
@Repository
public interface DashboardRepository extends JpaRepository<Service, UUID> {

    /**
     * Calculate total income for a given month.
     */
    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Service s " +
           "WHERE EXTRACT(YEAR FROM s.serviceDate) = :year " +
           "AND EXTRACT(MONTH FROM s.serviceDate) = :month")
    BigDecimal getTotalIncomeByMonth(@Param("year") int year,
                                      @Param("month") int month);

    /**
     * Calculate total profit for a given month.
     */
    @Query("SELECT COALESCE(SUM(s.netProfit), 0) FROM Service s " +
           "WHERE EXTRACT(YEAR FROM s.serviceDate) = :year " +
           "AND EXTRACT(MONTH FROM s.serviceDate) = :month")
    BigDecimal getTotalProfitByMonth(@Param("year") int year,
                                      @Param("month") int month);

    /**
     * Calculate total pending services count.
     */
    @Query("SELECT COUNT(s) FROM Service s WHERE s.status = :status")
    long getPendingServicesCount(@Param("status") ServiceStatus status);

    /**
     * Calculate total completed services count.
     */
    @Query("SELECT COUNT(s) FROM Service s WHERE s.status = :status")
    long getCompletedServicesCount(@Param("status") ServiceStatus status);

    /**
     * Calculate total income for a date range.
     */
    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Service s " +
           "WHERE s.serviceDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalIncomeByDateRange(@Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);

    /**
     * Calculate total profit for a date range.
     */
    @Query("SELECT COALESCE(SUM(s.netProfit), 0) FROM Service s " +
           "WHERE s.serviceDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalProfitByDateRange(@Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);

    /**
     * Count services by status for a date range.
     */
    @Query("SELECT COUNT(s) FROM Service s " +
           "WHERE s.serviceDate BETWEEN :startDate AND :endDate AND s.status = :status")
    long getServiceCountByStatusAndDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") ServiceStatus status);

    /**
     * Get total expense amount for a date range (via service costs).
     */
    @Query("SELECT COALESCE(SUM(s.vetCost + s.driverCost + s.extraCost), 0) FROM Service s " +
           "WHERE s.serviceDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCostsByDateRange(@Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    /**
     * Get pending services count for current month.
     */
    @Query("SELECT COUNT(s) FROM Service s WHERE s.status = :status " +
           "AND s.serviceDate >= CURRENT_DATE - INTERVAL '1 month' " +
           "AND EXTRACT(MONTH FROM s.serviceDate) = EXTRACT(MONTH FROM CURRENT_DATE)")
    long getPendingCountForCurrentMonth(@Param("status") ServiceStatus status);

    /**
     * Get completed services count for current month.
     */
    @Query("SELECT COUNT(s) FROM Service s WHERE s.status = :status " +
           "AND s.serviceDate >= CURRENT_DATE - INTERVAL '1 month' " +
           "AND EXTRACT(MONTH FROM s.serviceDate) = EXTRACT(MONTH FROM CURRENT_DATE)")
    long getCompletedCountForCurrentMonth(@Param("status") ServiceStatus status);
}
