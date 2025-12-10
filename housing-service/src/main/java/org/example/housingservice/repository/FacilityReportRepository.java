package org.example.housingservice.repository;

import org.example.housingservice.entity.FacilityReport;
import org.example.housingservice.enums.FacilityReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Facility Report Repository
 */
@Repository
public interface FacilityReportRepository extends JpaRepository<FacilityReport, Long> {

    /**
     * By facilityIDGet reportsList（ByCreation timeDescending order）
     */
    List<FacilityReport> findByFacilityIdOrderByCreateDateDesc(Long facilityId);

    /**
     * By facilityIDGet reports（pagination，ByCreation timeDescending order）
     */
    Page<FacilityReport> findByFacilityIdOrderByCreateDateDesc(Long facilityId, Pageable pageable);

    /**
     * ByemployeeIDGet reportsList
     */
    List<FacilityReport> findByEmployeeIdOrderByCreateDateDesc(Long employeeId);

    /**
     * ByStatusGet reportsList
     */
    List<FacilityReport> findByStatusOrderByCreateDateDesc(FacilityReportStatus status);

    /**
     * ByHouseIDGet all reports（through Facility associated）
     * ByCreation timeDescending ordersorting
     */
    @Query("SELECT fr FROM FacilityReport fr " +
           "JOIN fr.facility f " +
           "WHERE f.house.id = :houseId " +
           "ORDER BY fr.createDate DESC")
    List<FacilityReport> findByHouseIdOrderByCreateDateDesc(@Param("houseId") Long houseId);

    /**
     * ByHouseIDGet reports（pagination）
     */
    @Query("SELECT fr FROM FacilityReport fr " +
           "JOIN fr.facility f " +
           "WHERE f.house.id = :houseId " +
           "ORDER BY fr.createDate DESC")
    Page<FacilityReport> findByHouseIdOrderByCreateDateDesc(@Param("houseId") Long houseId, Pageable pageable);

    /**
     * Get reportsand itsComment
     */
    @Query("SELECT DISTINCT fr FROM FacilityReport fr " +
           "LEFT JOIN FETCH fr.comments " +
           "WHERE fr.id = :id")
    Optional<FacilityReport> findByIdWithComments(@Param("id") Long id);

    /**
     * Get reports completeInfo（includingfacilityandHouse）
     */
    @Query("SELECT fr FROM FacilityReport fr " +
           "JOIN FETCH fr.facility f " +
           "JOIN FETCH f.house " +
           "WHERE fr.id = :id")
    Optional<FacilityReport> findByIdWithDetails(@Param("id") Long id);

    /**
     * StatisticseachStatusReportscount
     */
    @Query("SELECT fr.status, COUNT(fr) FROM FacilityReport fr GROUP BY fr.status")
    List<Object[]> countByStatus();

    /**
     * StatisticsHouseReportscount
     */
    @Query("SELECT COUNT(fr) FROM FacilityReport fr " +
           "JOIN fr.facility f " +
           "WHERE f.house.id = :houseId")
    long countByHouseId(@Param("houseId") Long houseId);
}
