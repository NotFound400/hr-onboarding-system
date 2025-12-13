package org.example.applicationservice.dao;

import org.example.applicationservice.domain.DigitalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DigitalDocumentRepository extends JpaRepository<DigitalDocument,Long> {
//    List<DigitalDocument> findByApplicationId(Long applicationId);
    List<DigitalDocument> findByApplicationIdAndIdGreaterThan(Long applicationId, Long id);

//    List<DigitalDocument> findByApplicationEmployeeId(String employeeID);
    List<DigitalDocument> findByApplicationEmployeeIdAndIdGreaterThan(String employeeId, Long id);

//    List<DigitalDocument> findByType(String type);
    List<DigitalDocument> findByTypeAndIdGreaterThan(String type, Long id);

    List<DigitalDocument> findTop3ByOrderByIdAsc();
}
