package org.example.applicationservice.dao;

import org.example.applicationservice.domain.DigitalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DigitalDocumentRepository extends JpaRepository<DigitalDocument,Long> {
    List<DigitalDocument> findByApplicationId(Long applicationId);
    List<DigitalDocument> findByApplicationEmployeeId(String employeeID);
    List<DigitalDocument> findByType(String type);
    List<DigitalDocument> findByIsRequiredTrue();
}
