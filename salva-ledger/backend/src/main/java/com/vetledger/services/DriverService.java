package com.vetledger.services;

import com.vetledger.entities.Driver;
import com.vetledger.repositories.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Optional<Driver> getDriverById(UUID id) {
        return driverRepository.findById(id);
    }

    public Driver createDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public Driver updateDriver(UUID id, Driver driverDetails) {
        Optional<Driver> optionalDriver = driverRepository.findById(id);

        if (optionalDriver.isPresent()) {
            Driver driver = optionalDriver.get();

            // Update all fields
            driver.setName(driverDetails.getName());
            driver.setDefaultFee(driverDetails.getDefaultFee());
            driver.setActive(driverDetails.getActive());

            return driverRepository.save(driver);
        }

        return null;
    }

    public void deleteDriver(UUID id) {
        driverRepository.deleteById(id);
    }
}