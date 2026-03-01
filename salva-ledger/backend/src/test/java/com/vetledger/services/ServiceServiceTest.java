package com.vetledger.services;

import com.vetledger.entities.BusinessSettings;
import com.vetledger.entities.Service;
import com.vetledger.repositories.BusinessSettingsRepository;
import com.vetledger.repositories.ServiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private BusinessSettingsRepository businessSettingsRepository;

    @InjectMocks
    private ServiceService serviceService;

    // ------------------------------------------------------------------
    // calculateNetProfit tests
    // ------------------------------------------------------------------

    @Test
    void calculateNetProfit_allCostsPresent_correctResult() {
        Service service = new Service();
        service.setTotalAmount(new BigDecimal("500"));
        service.setVetCost(new BigDecimal("100"));
        service.setDriverCost(new BigDecimal("80"));
        service.setExtraCost(new BigDecimal("20"));
        service.setTaxAmount(new BigDecimal("50"));

        serviceService.calculateNetProfit(service);

        BigDecimal expected = new BigDecimal("250");
        assertEquals(0, expected.compareTo(service.getNetProfit()),
                "netProfit should be 250");
    }

    @Test
    void calculateNetProfit_nullCostsTreatedAsZero() {
        Service service = new Service();
        service.setTotalAmount(new BigDecimal("300"));
        // vetCost, driverCost, extraCost, taxAmount all left null

        serviceService.calculateNetProfit(service);

        BigDecimal expected = new BigDecimal("300");
        assertEquals(0, expected.compareTo(service.getNetProfit()),
                "netProfit should equal totalAmount when all costs are null");
    }

    @Test
    void calculateNetProfit_nullTotalAmount_netProfitNotSet() {
        Service service = new Service();
        // totalAmount intentionally left null

        serviceService.calculateNetProfit(service);

        assertNull(service.getNetProfit(),
                "netProfit should remain null when totalAmount is null");
    }

    // ------------------------------------------------------------------
    // calculateTaxAmount tests
    // ------------------------------------------------------------------

    @Test
    void calculateTaxAmount_withSettings_tenPercent() {
        BusinessSettings settings = new BusinessSettings();
        settings.setTaxPercentage(new BigDecimal("10"));

        when(businessSettingsRepository.findAll())
                .thenReturn(Collections.singletonList(settings));

        Service service = new Service();
        service.setTotalAmount(new BigDecimal("200"));

        serviceService.calculateTaxAmount(service);

        BigDecimal expected = new BigDecimal("20.00");
        assertEquals(0, expected.compareTo(service.getTaxAmount()),
                "taxAmount should be 20.00 for 10% of 200");
    }

    @Test
    void calculateTaxAmount_repeatingDecimalPercent_roundsHalfUp() {
        BusinessSettings settings = new BusinessSettings();
        settings.setTaxPercentage(new BigDecimal("33.33"));

        when(businessSettingsRepository.findAll())
                .thenReturn(Collections.singletonList(settings));

        Service service = new Service();
        service.setTotalAmount(new BigDecimal("100.00"));

        serviceService.calculateTaxAmount(service);

        BigDecimal expected = new BigDecimal("33.33");
        assertEquals(0, expected.compareTo(service.getTaxAmount()),
                "taxAmount should be 33.33 for 33.33% of 100.00");
    }

    @Test
    void calculateTaxAmount_noBusinessSettings_taxAmountUnchanged() {
        when(businessSettingsRepository.findAll())
                .thenReturn(Collections.emptyList());

        Service service = new Service();
        service.setTotalAmount(new BigDecimal("200"));

        serviceService.calculateTaxAmount(service);

        assertNull(service.getTaxAmount(),
                "taxAmount should remain null when no BusinessSettings are found");
    }

    // ------------------------------------------------------------------
    // createService tests
    // ------------------------------------------------------------------

    @Test
    void createService_calculatesTaxAndNetProfit() {
        BusinessSettings settings = new BusinessSettings();
        settings.setTaxPercentage(new BigDecimal("10"));

        when(businessSettingsRepository.findAll())
                .thenReturn(Collections.singletonList(settings));

        Service service = new Service();
        service.setTotalAmount(new BigDecimal("1000"));
        service.setVetCost(new BigDecimal("200"));
        service.setDriverCost(new BigDecimal("100"));
        service.setExtraCost(new BigDecimal("50"));

        when(serviceRepository.save(any(Service.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Service result = serviceService.createService(service);

        BigDecimal expectedTax = new BigDecimal("100.00");
        BigDecimal expectedNetProfit = new BigDecimal("550.00");

        assertEquals(0, expectedTax.compareTo(result.getTaxAmount()),
                "taxAmount should be 100.00");
        assertEquals(0, expectedNetProfit.compareTo(result.getNetProfit()),
                "netProfit should be 550.00");
    }

    // ------------------------------------------------------------------
    // updateService tests
    // ------------------------------------------------------------------

    @Test
    void updateService_recalculatesTaxAndNetProfit() {
        UUID id = UUID.randomUUID();

        // Existing service stored in the repository
        Service existingService = new Service();
        existingService.setId(id);
        existingService.setTotalAmount(new BigDecimal("999"));

        when(serviceRepository.findById(id))
                .thenReturn(Optional.of(existingService));

        BusinessSettings settings = new BusinessSettings();
        settings.setTaxPercentage(new BigDecimal("10"));

        when(businessSettingsRepository.findAll())
                .thenReturn(Collections.singletonList(settings));

        // Service detail payload carrying the updated values
        Service serviceDetails = new Service();
        serviceDetails.setTotalAmount(new BigDecimal("500"));
        serviceDetails.setVetCost(new BigDecimal("50"));
        serviceDetails.setDriverCost(new BigDecimal("50"));
        serviceDetails.setExtraCost(new BigDecimal("0"));

        when(serviceRepository.save(any(Service.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Service result = serviceService.updateService(id, serviceDetails);

        BigDecimal expectedTax = new BigDecimal("50.00");
        BigDecimal expectedNetProfit = new BigDecimal("350.00");

        assertEquals(0, expectedTax.compareTo(result.getTaxAmount()),
                "taxAmount should be 50.00");
        assertEquals(0, expectedNetProfit.compareTo(result.getNetProfit()),
                "netProfit should be 350.00");
    }
}
