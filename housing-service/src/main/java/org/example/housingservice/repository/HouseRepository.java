package org.example.housingservice.repository;

import org.example.housingservice.entity.House;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * House Repository
 */
@Repository
public interface HouseRepository extends JpaRepository<House, Long> {

    /**
     * By address fuzzy searchQuery
     */
    List<House> findByAddressContainingIgnoreCase(String address);

    /**
     * ByLandlordIDFind houses
     */
    List<House> findByLandlordId(Long landlordId);

    /**
     * Check if address already exists
     */
    boolean existsByAddress(String address);

    /**
     * GetHouseand itsLandlordInfo（to avoid N+1 issue）
     */
    @Query("SELECT h FROM House h JOIN FETCH h.landlord WHERE h.id = :id")
    Optional<House> findByIdWithLandlord(@Param("id") Long id);

    /**
     * GetallHouseand itsLandlordInfo
     */
    @Query("SELECT h FROM House h JOIN FETCH h.landlord")
    List<House> findAllWithLandlord();

    /**
     * GetHouseand itsfacilityInfo
     */
    @Query("SELECT DISTINCT h FROM House h LEFT JOIN FETCH h.facilities WHERE h.id = :id")
    Optional<House> findByIdWithFacilities(@Param("id") Long id);

    /**
     * GetHousecompleteInfo（Landlord + facility）
     */
    @Query("SELECT DISTINCT h FROM House h " +
            "JOIN FETCH h.landlord " +
            "LEFT JOIN FETCH h.facilities " +
            "WHERE h.id = :id")
    Optional<House> findByIdWithDetails(@Param("id") Long id);
}
