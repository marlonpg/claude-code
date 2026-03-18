package com.vetledger.repositories;

import com.vetledger.entities.Service;
import com.vetledger.entities.ServiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {

    List<Service> findByStatus(ServiceStatus status);

    List<Service> findByServiceDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT s FROM Service s WHERE s.serviceDate BETWEEN :startDate AND :endDate AND s.status = :status")
    List<Service> findByDateRangeAndStatus(@Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate,
                                          @Param("status") ServiceStatus status);

    @Query("SELECT s FROM Service s WHERE LOWER(s.description) LIKE %:search%")
    Page<Service> findBySearch(@Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.status = :status")
    Page<Service> findByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT s FROM Service s WHERE LOWER(s.description) LIKE %:search% AND s.status = :status")
    Page<Service> findBySearchAndStatus(@Param("search") String search,
                                        @Param("status") String status,
                                        Pageable pageable);
}