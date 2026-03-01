package com.vetledger.controllers;

import com.vetledger.entities.Driver;
import com.vetledger.repositories.DriverRepository;
import com.vetledger.services.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*")
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DriverService driverService;

    /**
     * Get all drivers
     * @return List of drivers
     */
    @GetMapping
    public ResponseEntity<List<Driver>> getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    /**
     * Get driver by ID
     * @param id Driver ID
     * @return Driver if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriverById(@PathVariable UUID id) {
        Optional<Driver> driver = driverService.getDriverById(id);
        return driver.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new driver
     * @param driver Driver to create
     * @return Created driver
     */
    @PostMapping
    public ResponseEntity<Driver> createDriver(@RequestBody Driver driver) {
        Driver savedDriver = driverService.createDriver(driver);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDriver);
    }

    /**
     * Update existing driver
     * @param id Driver ID
     * @param driverDetails Updated driver details
     * @return Updated driver
     */
    @PutMapping("/{id}")
    public ResponseEntity<Driver> updateDriver(@PathVariable UUID id, @RequestBody Driver driverDetails) {
        Driver updatedDriver = driverService.updateDriver(id, driverDetails);
        if (updatedDriver != null) {
            return ResponseEntity.ok(updatedDriver);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete driver
     * @param id Driver ID
     * @return ResponseEntity with status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable UUID id) {
        Optional<Driver> optionalDriver = driverService.getDriverById(id);

        if (optionalDriver.isPresent()) {
            driverService.deleteDriver(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}