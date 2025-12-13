package org.example.housingservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.housingservice.dto.LandlordDTO;
import org.example.housingservice.entity.Landlord;
import org.example.housingservice.exception.BusinessException;
import org.example.housingservice.exception.ResourceNotFoundException;
import org.example.housingservice.repository.LandlordRepository;
import org.example.housingservice.service.LandlordService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Landlord Service Implementation
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LandlordServiceImpl implements LandlordService {

    private final LandlordRepository landlordRepository;

    @Override
    @Transactional
    public LandlordDTO.Response createLandlord(LandlordDTO.CreateRequest request) {
        log.info("Creating landlord: {} {}", request.getFirstName(), request.getLastName());

        // Check if email already exists
        if (request.getEmail() != null && landlordRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists: " + request.getEmail());
        }

        Landlord landlord = Landlord.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .cellPhone(request.getCellPhone())
                .build();

        Landlord saved = landlordRepository.save(landlord);
        log.info("Landlord created with id: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    public LandlordDTO.Response getLandlordById(Long id) {
        Landlord landlord = findLandlordById(id);
        return mapToResponse(landlord);
    }

    @Override
    public List<LandlordDTO.Response> getAllLandlords() {
        return landlordRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LandlordDTO.Response updateLandlord(Long id, LandlordDTO.UpdateRequest request) {
        log.info("Updating landlord: {}", id);

        Landlord landlord = findLandlordById(id);

        if (request.getFirstName() != null) {
            landlord.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            landlord.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            // Check if email is already used by another landlord
            landlordRepository.findByEmail(request.getEmail())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new BusinessException("Email already in use: " + request.getEmail());
                        }
                    });
            landlord.setEmail(request.getEmail());
        }
        if (request.getCellPhone() != null) {
            landlord.setCellPhone(request.getCellPhone());
        }

        Landlord updated = landlordRepository.save(landlord);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteLandlord(Long id) {
        log.info("Deleting landlord: {}", id);
        Landlord landlord = findLandlordById(id);
        landlordRepository.delete(landlord);
    }

    @Override
    public List<LandlordDTO.Response> searchLandlords(String keyword) {
        return landlordRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ==================== Private Helper Methods ====================

    private Landlord findLandlordById(Long id) {
        return landlordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Landlord", "id", id));
    }

    private LandlordDTO.Response mapToResponse(Landlord landlord) {
        return LandlordDTO.Response.builder()
                .id(landlord.getId())
                .firstName(landlord.getFirstName())
                .lastName(landlord.getLastName())
                .fullName(landlord.getFullName())
                .email(landlord.getEmail())
                .cellPhone(landlord.getCellPhone())
                .build();
    }
}
