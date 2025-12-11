package org.example.employeeservice.repository;

import org.example.employeeservice.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    // Search name in firstName, lastName, or preferredName (contains, ignore case)
    @Query("{ '$or': [ " +
            "  { 'firstName': { $regex: ?0, $options: 'i' } }, " +
            "  { 'lastName': { $regex: ?0, $options: 'i' } }, " +
            "  { 'preferredName': { $regex: ?0, $options: 'i' } } " +
            "]}")
    List<Employee> searchByName(String name);

    Optional<Employee> findByUserID(Long userID);

    /**
     * Find all employees assigned to a specific house
     */
    List<Employee> findByHouseID(Long houseID);

    /**
     * Count employees in a specific house
     */
    int countByHouseID(Long houseID);

    /**
     * Check if employee exists by userID
     */
    boolean existsByUserID(Long userID);
}
