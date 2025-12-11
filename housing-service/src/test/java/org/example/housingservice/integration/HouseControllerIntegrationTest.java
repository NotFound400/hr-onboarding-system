package org.example.housingservice.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.housingservice.client.EmployeeServiceClient;
import org.example.housingservice.dto.HouseDTO;
import org.example.housingservice.entity.House;
import org.example.housingservice.entity.Landlord;
import org.example.housingservice.repository.HouseRepository;
import org.example.housingservice.repository.LandlordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for HouseController
 * 
 * Tests the full request-response cycle including:
 * - Role-based access control (HR vs Employee views)
 * - Data persistence with H2 in-memory database
 * - Service layer interactions
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("HouseController Integration Tests")
class HouseControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HouseRepository houseRepository;

    @Autowired
    private LandlordRepository landlordRepository;

    @MockBean
    private EmployeeServiceClient employeeServiceClient;

    private Landlord testLandlord;
    private House testHouse;

    @BeforeEach
    void setUp() {
        // Clean up and prepare test data
        houseRepository.deleteAll();
        landlordRepository.deleteAll();

        testLandlord = landlordRepository.save(Landlord.builder()
                .firstName("John")
                .lastName("Smith")
                .email("john.smith@landlord.com")
                .cellPhone("617-555-1234")
                .build());

        testHouse = houseRepository.save(House.builder()
                .landlord(testLandlord)
                .address("123 Main Street, Boston, MA 02101")
                .maxOccupant(6)
                .build());

        // Mock employee service responses
        when(employeeServiceClient.countEmployeesByHouseId(anyLong())).thenReturn(3);
        when(employeeServiceClient.getEmployeesByHouseId(anyLong())).thenReturn(List.of(
                new EmployeeServiceClient.EmployeeInfo(
                        101L, "Mike", "Johnson", "Mike", "555-0001", "mike@test.com", testHouse.getId()
                ),
                new EmployeeServiceClient.EmployeeInfo(
                        102L, "Sarah", "Chen", null, "555-0002", "sarah@test.com", testHouse.getId()
                )
        ));
    }

    @Nested
    @DisplayName("Role-Based View Tests")
    class RoleBasedViewTests {

        @Test
        @DisplayName("HR user should see full house list with landlord info")
        void getAllHouses_asHR_returnsFullInfo() throws Exception {
            mockMvc.perform(get("/api/housing/houses")
                            .header("X-User-Id", "1")
                            .header("X-Username", "hr@company.com")
                            .header("X-User-Roles", "HR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].viewType").value("HR_VIEW"))
                    .andExpect(jsonPath("$.data[0].landlordFullName").value("John Smith"))
                    .andExpect(jsonPath("$.data[0].numberOfEmployees").value(3))
                    .andExpect(jsonPath("$.data[0].maxOccupant").value(6));
        }

        @Test
        @DisplayName("Employee should see only their assigned house with roommates")
        void getAllHouses_asEmployee_returnsLimitedInfo() throws Exception {
            // Mock employee lookup
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(
                    new EmployeeServiceClient.EmployeeInfo(
                            101L, "Mike", "Johnson", "Mike", "555-0001", "mike@test.com", testHouse.getId()
                    )
            );

            mockMvc.perform(get("/api/housing/houses")
                            .header("X-User-Id", "101")
                            .header("X-Username", "mike@company.com")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].viewType").value("EMPLOYEE_VIEW"))
                    .andExpect(jsonPath("$.data[0].roommates").isArray())
                    .andExpect(jsonPath("$.data[0].landlordFullName").doesNotExist());
        }

        @Test
        @DisplayName("HR user should see full house details including facilities")
        void getHouseDetail_asHR_returnsFullDetails() throws Exception {
            mockMvc.perform(get("/api/housing/houses/{id}", testHouse.getId())
                            .header("X-User-Id", "1")
                            .header("X-User-Roles", "HR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.viewType").value("HR_VIEW"))
                    .andExpect(jsonPath("$.data.landlord").exists())
                    .andExpect(jsonPath("$.data.landlord.fullName").value("John Smith"))
                    .andExpect(jsonPath("$.data.address").value(containsString("123 Main Street")));
        }

        @Test
        @DisplayName("Employee should see roommates when viewing their assigned house")
        void getHouseDetail_asEmployee_returnsRoommates() throws Exception {
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(
                    new EmployeeServiceClient.EmployeeInfo(
                            101L, "Mike", "Johnson", "Mike", "555-0001", "mike@test.com", testHouse.getId()
                    )
            );

            mockMvc.perform(get("/api/housing/houses/{id}", testHouse.getId())
                            .header("X-User-Id", "101")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.viewType").value("EMPLOYEE_VIEW"))
                    .andExpect(jsonPath("$.data.roommates").isArray())
                    .andExpect(jsonPath("$.data.roommates[0].name").exists())
                    .andExpect(jsonPath("$.data.landlord").doesNotExist());
        }
    }

    @Nested
    @DisplayName("Access Control Tests")
    class AccessControlTests {

        @Test
        @DisplayName("Employee cannot access house they are not assigned to")
        void getHouseDetail_asEmployee_wrongHouse_returns403() throws Exception {
            // Employee 102 is assigned to a different house
            when(employeeServiceClient.getEmployeeById(102L)).thenReturn(
                    new EmployeeServiceClient.EmployeeInfo(
                            102L, "Sarah", "Chen", null, "555-0002", "sarah@test.com", 999L  // Different house
                    )
            );

            mockMvc.perform(get("/api/housing/houses/{id}", testHouse.getId())
                            .header("X-User-Id", "102")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value(containsString("assigned")));
        }

        @Test
        @DisplayName("Employee without assigned house sees empty list")
        void getAllHouses_asEmployee_noAssignment_returnsEmpty() throws Exception {
            when(employeeServiceClient.getEmployeeById(103L)).thenReturn(
                    new EmployeeServiceClient.EmployeeInfo(
                            103L, "Tom", "Wilson", null, "555-0003", "tom@test.com", null  // No house
                    )
            );

            mockMvc.perform(get("/api/housing/houses")
                            .header("X-User-Id", "103")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data").isEmpty());
        }
    }

    @Nested
    @DisplayName("CRUD Operations Tests")
    class CrudOperationsTests {

        @Test
        @DisplayName("HR can create a new house")
        void createHouse_asHR_success() throws Exception {
            HouseDTO.CreateRequest request = HouseDTO.CreateRequest.builder()
                    .landlordId(testLandlord.getId())
                    .address("456 Oak Avenue, Cambridge, MA 02139")
                    .maxOccupant(4)
                    .build();

            mockMvc.perform(post("/api/housing/houses")
                            .header("X-User-Roles", "HR")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.address").value("456 Oak Avenue, Cambridge, MA 02139"))
                    .andExpect(jsonPath("$.data.maxOccupant").value(4));
        }

        @Test
        @DisplayName("Cannot create house with duplicate address")
        void createHouse_duplicateAddress_returns400() throws Exception {
            HouseDTO.CreateRequest request = HouseDTO.CreateRequest.builder()
                    .landlordId(testLandlord.getId())
                    .address("123 Main Street, Boston, MA 02101")  // Same as existing
                    .maxOccupant(4)
                    .build();

            mockMvc.perform(post("/api/housing/houses")
                            .header("X-User-Roles", "HR")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value(containsString("already exists")));
        }

        @Test
        @DisplayName("HR can update house information")
        void updateHouse_asHR_success() throws Exception {
            HouseDTO.UpdateRequest request = HouseDTO.UpdateRequest.builder()
                    .address("789 Pine Street, Somerville, MA 02143")
                    .maxOccupant(8)
                    .build();

            mockMvc.perform(put("/api/housing/houses/{id}", testHouse.getId())
                            .header("X-User-Roles", "HR")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.address").value("789 Pine Street, Somerville, MA 02143"))
                    .andExpect(jsonPath("$.data.maxOccupant").value(8));
        }

        @Test
        @DisplayName("Cannot delete house with residents")
        void deleteHouse_withResidents_returns400() throws Exception {
            when(employeeServiceClient.countEmployeesByHouseId(testHouse.getId())).thenReturn(3);

            mockMvc.perform(delete("/api/housing/houses/{id}", testHouse.getId())
                            .header("X-User-Roles", "HR"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value(containsString("employees")));
        }

        @Test
        @DisplayName("Can delete empty house")
        void deleteHouse_empty_success() throws Exception {
            // Create a new empty house
            House emptyHouse = houseRepository.save(House.builder()
                    .landlord(testLandlord)
                    .address("Empty House Street")
                    .maxOccupant(2)
                    .build());

            when(employeeServiceClient.countEmployeesByHouseId(emptyHouse.getId())).thenReturn(0);

            mockMvc.perform(delete("/api/housing/houses/{id}", emptyHouse.getId())
                            .header("X-User-Roles", "HR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }
    }

    @Nested
    @DisplayName("Employee Endpoints Tests")
    class EmployeeEndpointsTests {

        @Test
        @DisplayName("Employee can get their assigned house via my-house endpoint")
        void getMyHouse_success() throws Exception {
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(
                    new EmployeeServiceClient.EmployeeInfo(
                            101L, "Mike", "Johnson", "Mike", "555-0001", "mike@test.com", testHouse.getId()
                    )
            );

            mockMvc.perform(get("/api/housing/houses/my-house")
                            .header("X-User-Id", "101")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(testHouse.getId()))
                    .andExpect(jsonPath("$.data.address").exists())
                    .andExpect(jsonPath("$.data.residents").isArray());
        }

        @Test
        @DisplayName("Employee without house gets appropriate message")
        void getMyHouse_noHouse_returnsMessage() throws Exception {
            when(employeeServiceClient.getEmployeeById(103L)).thenReturn(
                    new EmployeeServiceClient.EmployeeInfo(
                            103L, "Tom", "Wilson", null, "555-0003", "tom@test.com", null
                    )
            );

            mockMvc.perform(get("/api/housing/houses/my-house")
                            .header("X-User-Id", "103")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("You are not assigned to any house"))
                    .andExpect(jsonPath("$.data").doesNotExist());
        }
    }

    @Nested
    @DisplayName("Common Endpoints Tests")
    class CommonEndpointsTests {

        @Test
        @DisplayName("Get house summaries for dropdown selection")
        void getAllHouseSummaries_success() throws Exception {
            mockMvc.perform(get("/api/housing/houses/summaries"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].id").exists())
                    .andExpect(jsonPath("$.data[0].address").exists())
                    .andExpect(jsonPath("$.data[0].maxOccupant").exists())
                    .andExpect(jsonPath("$.data[0].currentOccupant").exists());
        }

        @Test
        @DisplayName("Get single house summary")
        void getHouseSummary_success() throws Exception {
            mockMvc.perform(get("/api/housing/houses/{id}/summary", testHouse.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(testHouse.getId()))
                    .andExpect(jsonPath("$.data.currentOccupant").value(3));
        }

        @Test
        @DisplayName("Get non-existent house returns 404")
        void getHouseSummary_notFound_returns404() throws Exception {
            mockMvc.perform(get("/api/housing/houses/999/summary"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }
}
