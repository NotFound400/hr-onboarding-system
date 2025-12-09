//package org.example.employeeservice;
//
//import org.example.employeeservice.exception.UpdateUserException;
//import org.example.employeeservice.model.Employee;
//import org.example.employeeservice.repository.EmployeeRepository;
//import org.example.employeeservice.service.EmployeeService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class EmployeeServiceTest {
//
//    @Mock
//    private EmployeeRepository employeeRepository;
//
//    @InjectMocks
//    private EmployeeService employeeService;
//
//    private Employee employee;
//
//    @BeforeEach
//    void setup() {
//        MockitoAnnotations.openMocks(this);
//        employee = new Employee();
//        employee.setId("1");
//        employee.setFirstName("John");
//        employee.setLastName("Doe");
//    }
//
//    @Test
//    void testGetAllEmployees() {
//        List<Employee> employees = Arrays.asList(employee);
//        when(employeeRepository.findAll()).thenReturn(employees);
//
//        List<Employee> result = employeeService.getAllEmployees();
//
//        assertEquals(1, result.size());
//        verify(employeeRepository, times(1)).findAll();
//    }
//
//    @Test
//    void testGetEmployeeById() {
//        when(employeeRepository.findById("1")).thenReturn(Optional.of(employee));
//
//        Optional<Employee> result = employeeService.getEmployeeById("1");
//
//        assertTrue(result.isPresent());
//        assertEquals("John", result.get().getFirstName());
//        verify(employeeRepository, times(1)).findById("1");
//    }
//
//    @Test
//    void testSaveEmployee() {
//        when(employeeRepository.save(employee)).thenReturn(employee);
//
//        Employee saved = employeeService.saveEmployee(employee);
//
//        assertNotNull(saved);
//        assertEquals("John", saved.getFirstName());
//        verify(employeeRepository, times(1)).save(employee);
//    }
//
//    @Test
//    void testUpdateEmployeeSuccess() {
//        when(employeeRepository.save(employee)).thenReturn(employee);
//
//        Employee updated = employeeService.updateEmployee(employee);
//
//        assertNotNull(updated);
//        verify(employeeRepository, times(1)).save(employee);
//    }
//
//    @Test
//    void testUpdateEmployeeThrowsExceptionWhenIdNull() {
//        employee.setId(null);
//
//        UpdateUserException exception = assertThrows(
//                UpdateUserException.class,
//                () -> employeeService.updateEmployee(employee)
//        );
//
//        assertEquals("Employee id is required", exception.getMessage());
//    }
//
//    @Test
//    void testDeleteEmployee() {
//        doNothing().when(employeeRepository).deleteById("1");
//
//        employeeService.deleteEmployee("1");
//
//        verify(employeeRepository, times(1)).deleteById("1");
//    }
//}
