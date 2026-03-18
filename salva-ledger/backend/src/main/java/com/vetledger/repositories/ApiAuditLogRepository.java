package com.vetledger.repositories;

import com.vetledger.entities.ApiAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApiAuditLogRepository extends JpaRepository<ApiAuditLog, java.util.UUID> {
    List<ApiAuditLog> findByCreatedAtAfter(LocalDateTime timestamp);
    List<ApiAuditLog> findByStatus(ApiAuditLog.Status status);
}
