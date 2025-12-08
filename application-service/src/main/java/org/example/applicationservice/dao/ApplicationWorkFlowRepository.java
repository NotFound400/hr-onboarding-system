package org.example.applicationservice.dao;

import com.example.common.ApplicationStatus;
import org.example.applicationservice.domain.ApplicationWorkFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationWorkFlowRepository extends JpaRepository<ApplicationWorkFlow,Long> {
    Optional<ApplicationWorkFlow> findFirstByEmployeeIdAndStatusInOrderByCreateDateDesc(
            String employeeID,
            List<ApplicationStatus> statuses
    );

    //fetch only active applications
    List<ApplicationWorkFlow> findByStatusInOrderByCreateDateDesc(List<ApplicationStatus> statuses);
    List<ApplicationWorkFlow> findByEmployeeIdOrderByCreateDateDesc(String employeeID);
    List<ApplicationWorkFlow> findByStatusOrderByCreateDateDesc(ApplicationStatus status);
}
