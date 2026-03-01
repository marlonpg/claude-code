package com.vetledger.services;

import com.vetledger.entities.Veterinarian;
import com.vetledger.repositories.VeterinarianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VeterinarianService {

    @Autowired
    private VeterinarianRepository veterinarianRepository;

    public List<Veterinarian> getAllVeterinarians() {
        return veterinarianRepository.findAll();
    }

    public Optional<Veterinarian> getVeterinarianById(UUID id) {
        return veterinarianRepository.findById(id);
    }

    public Veterinarian createVeterinarian(Veterinarian veterinarian) {
        return veterinarianRepository.save(veterinarian);
    }

    public Veterinarian updateVeterinarian(UUID id, Veterinarian veterinarianDetails) {
        Optional<Veterinarian> optionalVeterinarian = veterinarianRepository.findById(id);

        if (optionalVeterinarian.isPresent()) {
            Veterinarian veterinarian = optionalVeterinarian.get();

            // Update all fields
            veterinarian.setName(veterinarianDetails.getName());
            veterinarian.setDefaultFee(veterinarianDetails.getDefaultFee());
            veterinarian.setActive(veterinarianDetails.getActive());

            return veterinarianRepository.save(veterinarian);
        }

        return null;
    }

    public void deleteVeterinarian(UUID id) {
        veterinarianRepository.deleteById(id);
    }
}