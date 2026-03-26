package com.vetledger.controllers;

import com.vetledger.entities.Service;
import com.vetledger.repositories.ServiceRepository;
import com.vetledger.services.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServiceService serviceService;

    /**
     * Get all services with pagination and optional filters (search, status)
     * @param page Page number (0-based)
     * @param size Page size
     * @param sortBy Sort field
     * @param sortDir Sort direction (ASC or DESC)
     * @param search Search term for description field
     * @param status Filter by status (PENDING, COMPLETED, CANCELLED)
     * @return Page of services
     */
    @GetMapping
    public ResponseEntity<Page<Service>> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        // Build query based on filter parameters
        Sort sort = Sort.by(sortBy).descending();
        Page<Service> services;

        if (search != null && !search.isBlank() && status != null) {
            // Both search and status provided
            sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : sort;
            Pageable pageable = PageRequest.of(page, size, sort);
            services = serviceRepository.findBySearchAndStatus(search, status, pageable);
        } else if (search != null && !search.isBlank()) {
            // Only search provided
            sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : sort;
            Pageable pageable = PageRequest.of(page, size, sort);
            services = serviceRepository.findBySearch(search, pageable);
        } else if (status != null) {
            // Only status provided
            sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : sort;
            Pageable pageable = PageRequest.of(page, size, sort);
            services = serviceRepository.findByStatus(status, pageable);
        } else {
            // No filters - return all services
            Pageable pageableNoFilters = PageRequest.of(page, size, sort);
            services = serviceRepository.findAll(pageableNoFilters);
        }

        return ResponseEntity.ok(services);
    }

    /**
     * Get service by ID
     * @param id Service ID
     * @return Service if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable UUID id) {
        Optional<Service> service = serviceRepository.findById(id);
        return service.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new service
     * @param service Service to create
     * @return Created service
     */
    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody Service service) {
        Service savedService = serviceService.createService(service);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedService);
    }

    /**
     * Update existing service
     * @param id Service ID
     * @param serviceDetails Updated service details
     * @return Updated service
     */
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable UUID id, @RequestBody Service serviceDetails) {
        Service updatedService = serviceService.updateService(id, serviceDetails);
        if (updatedService != null) {
            return ResponseEntity.ok(updatedService);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete service
     * @param id Service ID
     * @return ResponseEntity with status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        Optional<Service> optionalService = serviceRepository.findById(id);

        if (optionalService.isPresent()) {
            serviceRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}