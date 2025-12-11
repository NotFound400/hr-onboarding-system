package org.example.housingservice.repository;

import org.example.housingservice.entity.FacilityReportDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Facility ReportDetail（Comment）Repository
 */
@Repository
public interface FacilityReportDetailRepository extends JpaRepository<FacilityReportDetail, Long> {

    /**
     * By reportIDGet commentsList（ByCreation timeascending order，oldest firstComment ）
     */
    List<FacilityReportDetail> findByFacilityReportIdOrderByCreateDateAsc(Long facilityReportId);

    /**
     * By reportIDGet commentsList（ByCreation timeDescending order， NewComment ）
     */
    List<FacilityReportDetail> findByFacilityReportIdOrderByCreateDateDesc(Long facilityReportId);

    /**
     * ByemployeeIDGet commentsList
     */
    List<FacilityReportDetail> findByEmployeeIdOrderByCreateDateDesc(Long employeeId);

    /**
     * By reportIDandemployeeIDGet comments（for checking if editable）
     */
    List<FacilityReportDetail> findByFacilityReportIdAndEmployeeId(Long facilityReportId, Long employeeId);

    /**
     * Statisticsreport'sCommentcount
     */
    long countByFacilityReportId(Long facilityReportId);

    /**
     * Deletereport'sallComment
     */
    void deleteByFacilityReportId(Long facilityReportId);
}
