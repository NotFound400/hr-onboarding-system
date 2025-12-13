package org.example.housingservice.repository;

import org.example.housingservice.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Facility Repository
 */
@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    /**
     * ByHouseIDGet facilitiesList
     */
    List<Facility> findByHouseId(Long houseId);

    /**
     * ByFacility typeFind
     */
    List<Facility> findByType(String type);

    /**
     * ByHouseIDandFacility typeFind
     */
    List<Facility> findByHouseIdAndType(Long houseId, String type);

    /**
     * GetHousefacilitiesStatistics
     * Returnformat: [type, totalQuantity]
     */
    @Query("SELECT f.type, SUM(f.quantity) FROM Facility f " +
            "WHERE f.house.id = :houseId " +
            "GROUP BY f.type")
    List<Object[]> getFacilitySummaryByHouseId(@Param("houseId") Long houseId);

    /**
     * DeleteHouseall facilities
     */
    void deleteByHouseId(Long houseId);
}
