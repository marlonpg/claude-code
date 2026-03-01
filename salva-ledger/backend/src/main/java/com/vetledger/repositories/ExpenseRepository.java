package com.vetledger.repositories;

import com.vetledger.entities.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate AND e.category = :category")
    List<Expense> findByDateRangeAndCategory(@Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate,
                                            @Param("category") String category);

    @Query("SELECT e FROM Expense e WHERE e.category = :category")
    Page<Expense> findByCategory(@Param("category") String category, Pageable pageable);

    @Query("SELECT e FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate")
    Page<Expense> findByDateBetween(@Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate,
                                   Pageable pageable);

    @Query("SELECT e FROM Expense e WHERE e.category = :category AND e.date BETWEEN :startDate AND :endDate")
    Page<Expense> findByCategoryAndDateRange(@Param("category") String category,
                                            @Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate,
                                            Pageable pageable);
}