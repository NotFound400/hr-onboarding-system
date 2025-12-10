package org.example.housingservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.housingservice.dto.HouseDTO;
import org.example.housingservice.dto.LandlordDTO;
import org.example.housingservice.service.HouseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for HouseController
 * Tests role-based view functionality
 */
@WebMvcTest(HouseController.class)
@DisplayName("HouseController Tests")
class HouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HouseService houseService;

    private HouseDTO.UnifiedDetailResponse hrDetailResponse;
    private HouseDTO.UnifiedDetailResponse employeeDetailResponse;
    private HouseDTO.UnifiedListResponse hrListResponse;
    private HouseDTO.UnifiedListResponse employeeListResponse;

    @BeforeEach
    void setUp() {
        // Setup HR detail response
        hrDetailResponse = HouseDTO.UnifiedDetailResponse.builder()
                .id(1L)
                .address("123 Main St")
                .maxOccupant(6)
                .numberOfEmployees(4)
                .landlord(LandlordDTO.Response.builder()
                        .id(1L)
                        .fullName("John Smith")
                        .email("john@landlord.com")
                        .cellPhone("555-1234")
                        .build())
                .facilitySummary(Map.of("Bed", 6, "Table", 2))
                .viewType("HR_VIEW")
                .build();

        // Setup Employee detail response
        employeeDetailResponse = HouseDTO.UnifiedDetailResponse.builder()
                .id(1L)
                .address("123 Main St")
                .roommates(List.of(
                        HouseDTO.ResidentInfo.builder()
                                .employeeId(101L)
                                .name("Mike")
                                .phone("555-0001")
                                .build(),
                        HouseDTO.ResidentInfo.builder()
                                .employeeId(102L)
                                .name("Sarah")
                                .phone("555-0002")
                                .build()
                ))
                .viewType("EMPLOYEE_VIEW")
                .build();

        // Setup HR list response
        hrListResponse = HouseDTO.UnifiedListResponse.builder()
                .id(1L)
                .address("123 Main St")
                .maxOccupant(6)
                .numberOfEmployees(4)
                .landlordFullName("John Smith")
                .viewType("HR_VIEW")
                .build();

        // Setup Employee list response
        employeeListResponse = HouseDTO.UnifiedListResponse.builder()
                .id(1L)
                .address("123 Main St")
                .roommates(List.of(
                        HouseDTO.ResidentInfo.builder()
                                .employeeId(101L)
                                .name("Mike")
                                .phone("555-0001")
                                .build()
                ))
                .viewType("EMPLOYEE_VIEW")
                .build();
    }

    @Nested
    @DisplayName("GET /api/housing/houses - Get All Houses")
    class GetAllHousesTests {

        @Test
        @DisplayName("HR user should get all houses with full information")
        void getAllHouses_asHR_returnsFullInfo() throws Exception {
            when(houseService.getAllHouses(any())).thenReturn(List.of(hrListResponse));

            mockMvc.perform(get("/api/housing/houses")
                            .header("X-User-Id", "1")
                            .header("X-Username", "hr@test.com")
                            .header("X-User-Roles", "HR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data[0].viewType").value("HR_VIEW"))
                    .andExpect(jsonPath("$.data[0].landlordFullName").value("John Smith"))
                    .andExpect(jsonPath("$.data[0].maxOccupant").value(6));

            verify(houseService).getAllHouses(any());
        }

        @Test
        @DisplayName("Employee should get only their assigned house")
        void getAllHouses_asEmployee_returnsLimitedInfo() throws Exception {
            when(houseService.getAllHouses(any())).thenReturn(List.of(employeeListResponse));

            mockMvc.perform(get("/api/housing/houses")
                            .header("X-User-Id", "101")
                            .header("X-Username", "employee@test.com")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data[0].viewType").value("EMPLOYEE_VIEW"))
                    .andExpect(jsonPath("$.data[0].roommates").isArray());

            verify(houseService).getAllHouses(any());
        }

        @Test
        @DisplayName("Request without headers should use default HR context")
        void getAllHouses_withoutHeaders_usesDefaultContext() throws Exception {
            when(houseService.getAllHouses(any())).thenReturn(List.of(hrListResponse));

            mockMvc.perform(get("/api/housing/houses"))
                    .andExpect(status().isOk());

            verify(houseService).getAllHouses(any());
        }
    }

    @Nested
    @DisplayName("GET /api/housing/houses/{id} - Get House Detail")
    class GetHouseDetailTests {

        @Test
        @DisplayName("HR user should get full house details")
        void getHouseDetail_asHR_returnsFullDetails() throws Exception {
            when(houseService.getHouseDetail(eq(1L), any())).thenReturn(hrDetailResponse);

            mockMvc.perform(get("/api/housing/houses/1")
                            .header("X-User-Id", "1")
                            .header("X-User-Roles", "HR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.viewType").value("HR_VIEW"))
                    .andExpect(jsonPath("$.data.landlord").exists())
                    .andExpect(jsonPath("$.data.facilitySummary").exists())
                    .andExpect(jsonPath("$.data.maxOccupant").value(6));

            verify(houseService).getHouseDetail(eq(1L), any());
        }

        @Test
        @DisplayName("Employee should get limited house details with roommates")
        void getHouseDetail_asEmployee_returnsLimitedDetails() throws Exception {
            when(houseService.getHouseDetail(eq(1L), any())).thenReturn(employeeDetailResponse);

            mockMvc.perform(get("/api/housing/houses/1")
                            .header("X-User-Id", "101")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.viewType").value("EMPLOYEE_VIEW"))
                    .andExpect(jsonPath("$.data.roommates").isArray())
                    .andExpect(jsonPath("$.data.roommates[0].name").value("Mike"))
                    .andExpect(jsonPath("$.data.landlord").doesNotExist())
                    .andExpect(jsonPath("$.data.facilitySummary").doesNotExist());

            verify(houseService).getHouseDetail(eq(1L), any());
        }
    }

    @Nested
    @DisplayName("POST /api/housing/houses - Create House")
    class CreateHouseTests {

        @Test
        @DisplayName("Should create house successfully")
        void createHouse_withValidRequest_returnsCreated() throws Exception {
            HouseDTO.CreateRequest request = HouseDTO.CreateRequest.builder()
                    .landlordId(1L)
                    .address("456 Oak Ave")
                    .maxOccupant(4)
                    .build();

            HouseDTO.DetailResponse response = HouseDTO.DetailResponse.builder()
                    .id(2L)
                    .address("456 Oak Ave")
                    .maxOccupant(4)
                    .build();

            when(houseService.createHouse(any())).thenReturn(response);

            mockMvc.perform(post("/api/housing/houses")
                            .header("X-User-Roles", "HR")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("House created successfully"))
                    .andExpect(jsonPath("$.data.id").value(2));

            verify(houseService).createHouse(any());
        }

        @Test
        @DisplayName("Should return 400 for invalid request")
        void createHouse_withInvalidRequest_returnsBadRequest() throws Exception {
            HouseDTO.CreateRequest request = HouseDTO.CreateRequest.builder()
                    .landlordId(null)  // Required field missing
                    .address("")  // Required field empty
                    .build();

            mockMvc.perform(post("/api/housing/houses")
                            .header("X-User-Roles", "HR")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());

            verify(houseService, never()).createHouse(any());
        }
    }

    @Nested
    @DisplayName("PUT /api/housing/houses/{id} - Update House")
    class UpdateHouseTests {

        @Test
        @DisplayName("Should update house successfully")
        void updateHouse_withValidRequest_returnsOk() throws Exception {
            HouseDTO.UpdateRequest request = HouseDTO.UpdateRequest.builder()
                    .address("789 Pine St")
                    .maxOccupant(8)
                    .build();

            HouseDTO.DetailResponse response = HouseDTO.DetailResponse.builder()
                    .id(1L)
                    .address("789 Pine St")
                    .maxOccupant(8)
                    .build();

            when(houseService.updateHouse(eq(1L), any())).thenReturn(response);

            mockMvc.perform(put("/api/housing/houses/1")
                            .header("X-User-Roles", "HR")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("House updated successfully"));

            verify(houseService).updateHouse(eq(1L), any());
        }
    }

    @Nested
    @DisplayName("DELETE /api/housing/houses/{id} - Delete House")
    class DeleteHouseTests {

        @Test
        @DisplayName("Should delete house successfully")
        void deleteHouse_returnsOk() throws Exception {
            doNothing().when(houseService).deleteHouse(1L);

            mockMvc.perform(delete("/api/housing/houses/1")
                            .header("X-User-Roles", "HR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("House deleted successfully"));

            verify(houseService).deleteHouse(1L);
        }
    }

    @Nested
    @DisplayName("GET /api/housing/houses/my-house - Get My House")
    class GetMyHouseTests {

        @Test
        @DisplayName("Employee should get their assigned house")
        void getMyHouse_withAssignedHouse_returnsHouse() throws Exception {
            HouseDTO.EmployeeViewResponse response = HouseDTO.EmployeeViewResponse.builder()
                    .id(1L)
                    .address("123 Main St")
                    .residents(List.of(
                            HouseDTO.ResidentInfo.builder()
                                    .employeeId(101L)
                                    .name("Mike")
                                    .phone("555-0001")
                                    .build()
                    ))
                    .build();

            when(houseService.getMyHouse(101L)).thenReturn(response);

            mockMvc.perform(get("/api/housing/houses/my-house")
                            .header("X-User-Id", "101")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.address").value("123 Main St"))
                    .andExpect(jsonPath("$.data.residents").isArray());

            verify(houseService).getMyHouse(101L);
        }

        @Test
        @DisplayName("Employee without assigned house should get null")
        void getMyHouse_withoutAssignedHouse_returnsNull() throws Exception {
            when(houseService.getMyHouse(102L)).thenReturn(null);

            mockMvc.perform(get("/api/housing/houses/my-house")
                            .header("X-User-Id", "102")
                            .header("X-User-Roles", "EMPLOYEE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("You are not assigned to any house"));

            verify(houseService).getMyHouse(102L);
        }
    }

    @Nested
    @DisplayName("GET /api/housing/houses/summaries - Get Summaries")
    class GetSummariesTests {

        @Test
        @DisplayName("Should return all house summaries")
        void getSummaries_returnsList() throws Exception {
            List<HouseDTO.Summary> summaries = List.of(
                    HouseDTO.Summary.builder()
                            .id(1L)
                            .address("123 Main St")
                            .maxOccupant(6)
                            .currentOccupant(4)
                            .build(),
                    HouseDTO.Summary.builder()
                            .id(2L)
                            .address("456 Oak Ave")
                            .maxOccupant(4)
                            .currentOccupant(2)
                            .build()
            );

            when(houseService.getAllHouseSummaries()).thenReturn(summaries);

            mockMvc.perform(get("/api/housing/houses/summaries"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2));

            verify(houseService).getAllHouseSummaries();
        }
    }
}
