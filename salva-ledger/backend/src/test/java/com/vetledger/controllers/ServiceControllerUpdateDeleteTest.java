package com.vetledger.controllers;

import com.vetledger.entities.Service;
import com.vetledger.entities.ServiceStatus;
import com.vetledger.repositories.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ServiceControllerUpdateDeleteTest {

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private ServiceController serviceController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void updateService_Exists_ReturnsUpdatedService() {
        // Arrange
        UUID testId = UUID.randomUUID();
        Service existingService = new Service(testId);
        existingService.setNumber(1);
        existingService.setDescription("Old Description");

        Service updateService = new Service();
        updateService.setNumber(2);
        updateService.setDescription("New Description");

        when(serviceRepository.findById(testId)).thenReturn(Optional.of(existingService));
        when(serviceRepository.save(any(Service.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ResponseEntity<Service> response = serviceController.updateService(testId, updateService);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getNumber());
        assertEquals("New Description", response.getBody().getDescription());
        verify(serviceRepository, times(1)).findById(testId);
        verify(serviceRepository, times(1)).save(any(Service.class));
    }

    @Test
    void updateService_NotExists_ReturnsNotFound() {
        // Arrange
        UUID testId = UUID.randomUUID();
        Service updateService = new Service();
        updateService.setNumber(2);
        updateService.setDescription("New Description");

        when(serviceRepository.findById(testId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Service> response = serviceController.updateService(testId, updateService);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(serviceRepository, times(1)).findById(testId);
        verify(serviceRepository, never()).save(any(Service.class));
    }

    @Test
    void deleteService_Exists_ReturnsNoContent() {
        // Arrange
        UUID testId = UUID.randomUUID();
        when(serviceRepository.findById(testId)).thenReturn(Optional.of(new Service(testId)));

        // Act
        ResponseEntity<Void> response = serviceController.deleteService(testId);

        // Assert
        assertEquals(HttpStatus.noContent().getStatusCode(), response.getStatusCode());
        verify(serviceRepository, times(1)).findById(testId);
        verify(serviceRepository, times(1)).deleteById(testId);
    }

    @Test
    void deleteService_NotExists_ReturnsNotFound() {
        // Arrange
        UUID testId = UUID.randomUUID();
        when(serviceRepository.findById(testId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Void> response = serviceController.deleteService(testId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND.getStatusCode(), response.getStatusCode());
        verify(serviceRepository, times(1)).findById(testId);
        verify(serviceRepository, never()).deleteById(testId);
    }
}