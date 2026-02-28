package com.vetledger.repositories;

import com.vetledger.entities.BusinessSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BusinessSettingsRepository extends JpaRepository<BusinessSettings, UUID> {
}