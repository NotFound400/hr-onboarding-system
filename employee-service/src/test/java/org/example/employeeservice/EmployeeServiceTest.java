package org.example.employeeservice;

import org.example.employeeservice.exception.UpdateUserException;
import org.example.employeeservice.model.Employee;
import org.example.employeeservice.repository.EmployeeRepository;
import org.example.employeeservice.service.EmployeeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllEmployees() {
        when(employeeRepository.findAll()).thenReturn(List.of(new Employee(), new Employee()));
        assertEquals(2, employeeService.getAllEmployees().size());
        verify(employeeRepository, times(1)).findAll();
    }

    @Test
    void testGetAllEmployeesPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Employee> page = new PageImpl<>(List.of(new Employee()));
        when(employeeRepository.findAll(pageable)).thenReturn(page);

        Page<Employee> result = employeeService.getAllEmployeesPage(pageable);
        assertEquals(1, result.getTotalElements());
        verify(employeeRepository, times(1)).findAll(pageable);
    }

    @Test
    void testGetEmployeeById() {
        Employee employee = new Employee();
        employee.setId("123");
        when(employeeRepository.findById("123")).thenReturn(Optional.of(employee));

        Optional<Employee> result = employeeService.getEmployeeById("123");
        assertTrue(result.isPresent());
        assertEquals("123", result.get().getId());
    }

    @Test
    void testSaveEmployee() {
        Employee employee = new Employee();
        when(employeeRepository.save(employee)).thenReturn(employee);

        Employee result = employeeService.saveEmployee(employee);
        assertNotNull(result);
        verify(employeeRepository, times(1)).save(employee);
    }

    @Test
    void testUpdateEmployeeSuccess() {
        Employee employee = new Employee();
        employee.setId("111");

        when(employeeRepository.save(employee)).thenReturn(employee);

        Employee updated = employeeService.updateEmployee(employee);
        assertEquals(employee, updated);
        verify(employeeRepository, times(1)).save(employee);
    }

    @Test
    void testUpdateEmployeeThrowsException() {
        Employee employee = new Employee(); // no id

        assertThrows(UpdateUserException.class, () -> employeeService.updateEmployee(employee));
        verify(employeeRepository, never()).save(employee);
    }

    @Test
    void testSearchEmployeesByName() {
        when(employeeRepository.searchByName("John"))
                .thenReturn(List.of(new Employee(), new Employee()));

        List<Employee> list = employeeService.searchEmployeesByName("John");
        assertEquals(2, list.size());
        verify(employeeRepository, times(1)).searchByName("John");
    }

    @Test
    void testDeleteEmployee() {
        doNothing().when(employeeRepository).deleteById("111");

        employeeService.deleteEmployee("111");
        verify(employeeRepository, times(1)).deleteById("111");
    }
}
