package com.vetledger.controllers;

import com.vetledger.entities.Service;
import com.vetledger.entities.ServiceStatus;
import com.vetledger.repositories.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ServiceControllerTest {

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private ServiceController serviceController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllServices_ReturnsPageOfServices() {
        // Arrange
        Page<Service> mockPage = new PageImpl<>(Arrays.asList(new Service()));
        when(serviceRepository.findAll(any(PageRequest.class))).thenReturn(mockPage);

        // Act
        ResponseEntity<Page<Service>> response = serviceController.getAllServices(0, 10, "createdAt", "DESC");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getNumberOfElements());
        verify(serviceRepository, times(1)).findAll(any(PageRequest.class));
    }

    @Test
    void getServiceById_Exists_ReturnsService() {
        // Arrange
        UUID testId = UUID.randomUUID();
        Service mockService = new Service(testId);
        when(serviceRepository.findById(testId)).thenReturn(Optional.of(mockService));

        // Act
        ResponseEntity<Service> response = serviceController.getServiceById(testId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testId, response.getBody().getId());
        verify(serviceRepository, times(1)).findById(testId);
    }

    @Test
    void getServiceById_NotExists_ReturnsNotFound() {
        // Arrange
        UUID testId = UUID.randomUUID();
        when(serviceRepository.findById(testId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Service> response = serviceController.getServiceById(testId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(serviceRepository, times(1)).findById(testId);
    }

    @Test
    void createService_ReturnsCreatedService() {
        // Arrange
        Service mockService = new Service();
        mockService.setId(UUID.randomUUID());
        mockService.setNumber(1);
        mockService.setDescription("Test Service");
        mockService.setTotalAmount(new BigDecimal("100.00"));
        mockService.setRequesterName("Test Requester");
        mockService.setStatus(ServiceStatus.PENDING);
        mockService.setServiceDate(LocalDate.now());

        when(serviceRepository.save(any(Service.class))).thenReturn(mockService);

        // Act
        ResponseEntity<Service> response = serviceController.createService(mockService);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(mockService.getId(), response.getBody().getId());
        verify(serviceRepository, times(1)).save(any(Service.class));
    }
}