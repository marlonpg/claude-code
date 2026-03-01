package com.vetledger.services;

import com.vetledger.entities.BusinessSettings;
import com.vetledger.entities.Service;
import com.vetledger.repositories.BusinessSettingsRepository;
import com.vetledger.repositories.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private BusinessSettingsRepository businessSettingsRepository;

    public Service createService(Service service) {
        // Calculate tax amount based on business settings
        calculateTaxAmount(service);

        // Calculate net profit
        calculateNetProfit(service);

        return serviceRepository.save(service);
    }

    public Service updateService(UUID id, Service serviceDetails) {
        Optional<Service> optionalService = serviceRepository.findById(id);

        if (optionalService.isPresent()) {
            Service service = optionalService.get();

            // Update all fields
            service.setNumber(serviceDetails.getNumber());
            service.setDescription(serviceDetails.getDescription());
            service.setTotalAmount(serviceDetails.getTotalAmount());
            service.setRequesterName(serviceDetails.getRequesterName());
            service.setVeterinarian(serviceDetails.getVeterinarian());
            service.setDriver(serviceDetails.getDriver());
            service.setExtraCost(serviceDetails.getExtraCost());
            service.setDriverCost(serviceDetails.getDriverCost());
            service.setVetCost(serviceDetails.getVetCost());
            // Note: taxAmount and netProfit will be recalculated

            // Calculate tax amount based on business settings
            calculateTaxAmount(service);

            // Calculate net profit
            calculateNetProfit(service);

            return serviceRepository.save(service);
        }

        return null;
    }

    private void calculateTaxAmount(Service service) {
        // Get the current business settings
        // In a real implementation, we might have a way to get the current business settings
        // For now, we'll look for any business settings record
        Optional<BusinessSettings> businessSettings = businessSettingsRepository.findAll().stream().findFirst();

        if (businessSettings.isPresent()) {
            BigDecimal taxPercentage = businessSettings.get().getTaxPercentage();
            if (taxPercentage != null && service.getTotalAmount() != null) {
                service.setTaxAmount(service.getTotalAmount().multiply(taxPercentage).divide(BigDecimal.valueOf(100)));
            }
        }
    }

    private void calculateNetProfit(Service service) {
        // netProfit = totalAmount - vetCost - driverCost - extraCost - taxAmount
        BigDecimal netProfit = service.getTotalAmount();

        if (netProfit != null) {
            if (service.getVetCost() != null) {
                netProfit = netProfit.subtract(service.getVetCost());
            }
            if (service.getDriverCost() != null) {
                netProfit = netProfit.subtract(service.getDriverCost());
            }
            if (service.getExtraCost() != null) {
                netProfit = netProfit.subtract(service.getExtraCost());
            }
            if (service.getTaxAmount() != null) {
                netProfit = netProfit.subtract(service.getTaxAmount());
            }
            service.setNetProfit(netProfit);
        }
    }
}