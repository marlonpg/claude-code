package com.vetledger.controllers;

import com.vetledger.entities.Veterinarian;
import com.vetledger.repositories.VeterinarianRepository;
import com.vetledger.services.VeterinarianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/veterinarians")
@CrossOrigin(origins = "*")
public class VeterinarianController {

    @Autowired
    private VeterinarianRepository veterinarianRepository;

    @Autowired
    private VeterinarianService veterinarianService;

    /**
     * Get all veterinarians
     * @return List of veterinarians
     */
    @GetMapping
    public ResponseEntity<List<Veterinarian>> getAllVeterinarians() {
        List<Veterinarian> veterinarians = veterinarianService.getAllVeterinarians();
        return ResponseEntity.ok(veterinarians);
    }

    /**
     * Get veterinarian by ID
     * @param id Veterinarian ID
     * @return Veterinarian if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Veterinarian> getVeterinarianById(@PathVariable UUID id) {
        Optional<Veterinarian> veterinarian = veterinarianService.getVeterinarianById(id);
        return veterinarian.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new veterinarian
     * @param veterinarian Veterinarian to create
     * @return Created veterinarian
     */
    @PostMapping
    public ResponseEntity<Veterinarian> createVeterinarian(@RequestBody Veterinarian veterinarian) {
        Veterinarian savedVeterinarian = veterinarianService.createVeterinarian(veterinarian);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedVeterinarian);
    }

    /**
     * Update existing veterinarian
     * @param id Veterinarian ID
     * @param veterinarianDetails Updated veterinarian details
     * @return Updated veterinarian
     */
    @PutMapping("/{id}")
    public ResponseEntity<Veterinarian> updateVeterinarian(@PathVariable UUID id, @RequestBody Veterinarian veterinarianDetails) {
        Veterinarian updatedVeterinarian = veterinarianService.updateVeterinarian(id, veterinarianDetails);
        if (updatedVeterinarian != null) {
            return ResponseEntity.ok(updatedVeterinarian);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete veterinarian
     * @param id Veterinarian ID
     * @return ResponseEntity with status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVeterinarian(@PathVariable UUID id) {
        Optional<Veterinarian> optionalVeterinarian = veterinarianService.getVeterinarianById(id);

        if (optionalVeterinarian.isPresent()) {
            veterinarianService.deleteVeterinarian(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}