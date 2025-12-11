package org.example.housingservice.repository;

import org.example.housingservice.entity.Landlord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Landlord Repository
 */
@Repository
public interface LandlordRepository extends JpaRepository<Landlord, Long> {

    /**
     * Find landlord by email
     */
    Optional<Landlord> findByEmail(String email);

    /**
     * Find landlord by phone number
     */
    Optional<Landlord> findByCellPhone(String cellPhone);

    /**
     * By name fuzzy searchQuery
     */
    List<Landlord> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);

    /**
     * Check if email already exists
     */
    boolean existsByEmail(String email);
}
