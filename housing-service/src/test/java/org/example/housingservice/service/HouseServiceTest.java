package org.example.housingservice.service;

import org.example.housingservice.client.EmployeeServiceClient;
import org.example.housingservice.context.UserContext;
import org.example.housingservice.dto.HouseDTO;
import org.example.housingservice.entity.House;
import org.example.housingservice.entity.Landlord;
import org.example.housingservice.exception.BusinessException;
import org.example.housingservice.exception.ForbiddenException;
import org.example.housingservice.exception.ResourceNotFoundException;
import org.example.housingservice.repository.FacilityRepository;
import org.example.housingservice.repository.HouseRepository;
import org.example.housingservice.repository.LandlordRepository;
import org.example.housingservice.service.impl.HouseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * HouseService Unit Tests
 * 
 * Tests role-based access control and house management operations
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("HouseService Unit Tests")
class HouseServiceTest {

    @Mock
    private HouseRepository houseRepository;

    @Mock
    private LandlordRepository landlordRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private EmployeeServiceClient employeeServiceClient;

    @InjectMocks
    private HouseServiceImpl houseService;

    private Landlord testLandlord;
    private House testHouse;

    @BeforeEach
    void setUp() {
        // Prepare test data
        testLandlord = Landlord.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .cellPhone("123-456-7890")
                .build();

        testHouse = House.builder()
                .id(1L)
                .landlord(testLandlord)
                .address("123 Main Street, City, State 12345")
                .maxOccupant(4)
                .build();
    }

    @Nested
    @DisplayName("Role-based Access Tests")
    class RoleBasedAccessTests {

        @Test
        @DisplayName("getHouseDetail - HR should get full house information")
        void getHouseDetail_asHR_returnsFullInfo() {
            // Given
            UserContext hrContext = UserContext.hrUser(1L);
            when(houseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.countEmployeesByHouseId(1L)).thenReturn(2);

            // When
            HouseDTO.UnifiedDetailResponse result = houseService.getHouseDetail(1L, hrContext);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getViewType()).isEqualTo("HR_VIEW");
            assertThat(result.getLandlord()).isNotNull();
            assertThat(result.getNumberOfEmployees()).isEqualTo(2);
        }

        @Test
        @DisplayName("getHouseDetail - Employee with access should get limited information")
        void getHouseDetail_asEmployee_withAccess_returnsLimitedInfo() {
            // Given
            UserContext employeeContext = UserContext.employeeUser(101L);
            EmployeeServiceClient.EmployeeInfo employeeInfo = new EmployeeServiceClient.EmployeeInfo(
                    101L, "Mike", "Smith", "Mike", "555-0001", "mike@test.com", 1L
            );
            
            when(houseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(employeeInfo);
            when(employeeServiceClient.getEmployeesByHouseId(1L)).thenReturn(List.of(employeeInfo));

            // When
            HouseDTO.UnifiedDetailResponse result = houseService.getHouseDetail(1L, employeeContext);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getViewType()).isEqualTo("EMPLOYEE_VIEW");
            assertThat(result.getRoommates()).isNotNull();
            assertThat(result.getLandlord()).isNull();
            assertThat(result.getFacilitySummary()).isNull();
        }

        @Test
        @DisplayName("getHouseDetail - Employee without access should throw ForbiddenException")
        void getHouseDetail_asEmployee_withoutAccess_throwsForbidden() {
            // Given
            UserContext employeeContext = UserContext.employeeUser(101L);
            EmployeeServiceClient.EmployeeInfo employeeInfo = new EmployeeServiceClient.EmployeeInfo(
                    101L, "Mike", "Smith", "Mike", "555-0001", "mike@test.com", 2L // Different house
            );
            
            when(houseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(employeeInfo);

            // When/Then
            assertThatThrownBy(() -> houseService.getHouseDetail(1L, employeeContext))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("You can only view the house you are assigned to");
        }

        @Test
        @DisplayName("getAllHouses - HR should get all houses")
        void getAllHouses_asHR_returnsAllHouses() {
            // Given
            UserContext hrContext = UserContext.hrUser(1L);
            when(houseRepository.findAllWithLandlord()).thenReturn(List.of(testHouse));
            when(employeeServiceClient.countEmployeesByHouseId(1L)).thenReturn(2);

            // When
            List<HouseDTO.UnifiedListResponse> result = houseService.getAllHouses(hrContext);

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getViewType()).isEqualTo("HR_VIEW");
            assertThat(result.get(0).getLandlordFullName()).isEqualTo("John Doe");
        }

        @Test
        @DisplayName("getAllHouses - Employee should only get their assigned house")
        void getAllHouses_asEmployee_returnsOnlyAssignedHouse() {
            // Given
            UserContext employeeContext = UserContext.employeeUser(101L);
            EmployeeServiceClient.EmployeeInfo employeeInfo = new EmployeeServiceClient.EmployeeInfo(
                    101L, "Mike", "Smith", "Mike", "555-0001", "mike@test.com", 1L
            );
            
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(employeeInfo);
            when(houseRepository.findById(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.getEmployeesByHouseId(1L)).thenReturn(List.of(employeeInfo));

            // When
            List<HouseDTO.UnifiedListResponse> result = houseService.getAllHouses(employeeContext);

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getViewType()).isEqualTo("EMPLOYEE_VIEW");
        }

        @Test
        @DisplayName("getAllHouses - Employee without assigned house should get empty list")
        void getAllHouses_asEmployee_withoutAssignedHouse_returnsEmptyList() {
            // Given
            UserContext employeeContext = UserContext.employeeUser(101L);
            EmployeeServiceClient.EmployeeInfo employeeInfo = new EmployeeServiceClient.EmployeeInfo(
                    101L, "Mike", "Smith", "Mike", "555-0001", "mike@test.com", null // No house
            );
            
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(employeeInfo);

            // When
            List<HouseDTO.UnifiedListResponse> result = houseService.getAllHouses(employeeContext);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Create House Tests")
    class CreateHouseTests {

        @Test
        @DisplayName("Should create house successfully")
        void createHouse_Success() {
            // Given
            HouseDTO.CreateRequest request = HouseDTO.CreateRequest.builder()
                    .landlordId(1L)
                    .address("123 Main Street")
                    .maxOccupant(4)
                    .build();

            when(houseRepository.existsByAddress(anyString())).thenReturn(false);
            when(landlordRepository.findById(1L)).thenReturn(Optional.of(testLandlord));
            when(houseRepository.save(any(House.class))).thenReturn(testHouse);
            when(employeeServiceClient.countEmployeesByHouseId(anyLong())).thenReturn(0);

            // When
            HouseDTO.DetailResponse result = houseService.createHouse(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getAddress()).isEqualTo(testHouse.getAddress());
            verify(houseRepository).save(any(House.class));
        }

        @Test
        @DisplayName("Should throw exception when address already exists")
        void createHouse_AddressExists_ThrowsException() {
            // Given
            HouseDTO.CreateRequest request = HouseDTO.CreateRequest.builder()
                    .landlordId(1L)
                    .address("123 Main Street")
                    .maxOccupant(4)
                    .build();

            when(houseRepository.existsByAddress(anyString())).thenReturn(true);

            // When/Then
            assertThatThrownBy(() -> houseService.createHouse(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("Should throw exception when landlord not found")
        void createHouse_LandlordNotFound_ThrowsException() {
            // Given
            HouseDTO.CreateRequest request = HouseDTO.CreateRequest.builder()
                    .landlordId(999L)
                    .address("123 Main Street")
                    .maxOccupant(4)
                    .build();

            when(houseRepository.existsByAddress(anyString())).thenReturn(false);
            when(landlordRepository.findById(999L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> houseService.createHouse(request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Landlord");
        }
    }

    @Nested
    @DisplayName("Get House Detail Tests")
    class GetHouseDetailTests {

        @Test
        @DisplayName("Should get house detail for HR successfully")
        void getHouseDetailForHR_Success() {
            // Given
            when(houseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.countEmployeesByHouseId(1L)).thenReturn(3);

            // When
            HouseDTO.DetailResponse result = houseService.getHouseDetailForHR(1L);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getNumberOfEmployees()).isEqualTo(3);
        }

        @Test
        @DisplayName("Should throw exception when house not found")
        void getHouseDetailForHR_NotFound_ThrowsException() {
            // Given
            when(houseRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> houseService.getHouseDetailForHR(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("House");
        }
    }

    @Nested
    @DisplayName("Employee House Access Tests")
    class EmployeeHouseAccessTests {

        @Test
        @DisplayName("getMyHouse - Should return employee's assigned house")
        void getMyHouse_withAssignedHouse_returnsHouse() {
            // Given
            EmployeeServiceClient.EmployeeInfo employeeInfo = new EmployeeServiceClient.EmployeeInfo(
                    101L, "Mike", "Smith", "Mike", "555-0001", "mike@test.com", 1L
            );
            
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(employeeInfo);
            when(houseRepository.findById(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.getEmployeesByHouseId(1L)).thenReturn(List.of(employeeInfo));

            // When
            HouseDTO.EmployeeViewResponse result = houseService.getMyHouse(101L);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getResidents()).hasSize(1);
        }

        @Test
        @DisplayName("getMyHouse - Should return null when employee has no assigned house")
        void getMyHouse_withoutAssignedHouse_returnsNull() {
            // Given
            EmployeeServiceClient.EmployeeInfo employeeInfo = new EmployeeServiceClient.EmployeeInfo(
                    101L, "Mike", "Smith", "Mike", "555-0001", "mike@test.com", null
            );
            
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(employeeInfo);

            // When
            HouseDTO.EmployeeViewResponse result = houseService.getMyHouse(101L);

            // Then
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("getHouseForEmployee - Should validate employee access")
        void getHouseForEmployee_withValidAccess_returnsHouse() {
            // Given
            EmployeeServiceClient.EmployeeInfo employeeInfo = new EmployeeServiceClient.EmployeeInfo(
                    101L, "Mike", "Smith", "Mike", "555-0001", "mike@test.com", 1L
            );
            
            when(houseRepository.findById(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(employeeInfo);
            when(employeeServiceClient.getEmployeesByHouseId(1L)).thenReturn(List.of(employeeInfo));

            // When
            HouseDTO.EmployeeViewResponse result = houseService.getHouseForEmployee(1L, 101L);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("getHouseForEmployee - Should throw when employee accessing wrong house")
        void getHouseForEmployee_withInvalidAccess_throwsForbidden() {
            // Given
            EmployeeServiceClient.EmployeeInfo employeeInfo = new EmployeeServiceClient.EmployeeInfo(
                    101L, "Mike", "Smith", "Mike", "555-0001", "mike@test.com", 2L // Different house
            );
            
            when(houseRepository.findById(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.getEmployeeById(101L)).thenReturn(employeeInfo);

            // When/Then
            assertThatThrownBy(() -> houseService.getHouseForEmployee(1L, 101L))
                    .isInstanceOf(ForbiddenException.class);
        }
    }

    @Nested
    @DisplayName("Delete House Tests")
    class DeleteHouseTests {

        @Test
        @DisplayName("Should delete house successfully when no employees")
        void deleteHouse_Success() {
            // Given
            when(houseRepository.findById(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.countEmployeesByHouseId(1L)).thenReturn(0);

            // When
            houseService.deleteHouse(1L);

            // Then
            verify(houseRepository).delete(testHouse);
        }

        @Test
        @DisplayName("Should throw exception when house has employees")
        void deleteHouse_HasEmployees_ThrowsException() {
            // Given
            when(houseRepository.findById(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.countEmployeesByHouseId(1L)).thenReturn(2);

            // When/Then
            assertThatThrownBy(() -> houseService.deleteHouse(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("employees living");
        }
    }

    @Nested
    @DisplayName("Common Operations Tests")
    class CommonOperationsTests {

        @Test
        @DisplayName("existsById should return true when house exists")
        void existsById_True() {
            // Given
            when(houseRepository.existsById(1L)).thenReturn(true);

            // When
            boolean result = houseService.existsById(1L);

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("existsById should return false when house does not exist")
        void existsById_False() {
            // Given
            when(houseRepository.existsById(999L)).thenReturn(false);

            // When
            boolean result = houseService.existsById(999L);

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("getHouseSummary should return summary with occupancy")
        void getHouseSummary_returnsSummaryWithOccupancy() {
            // Given
            when(houseRepository.findById(1L)).thenReturn(Optional.of(testHouse));
            when(employeeServiceClient.countEmployeesByHouseId(1L)).thenReturn(2);

            // When
            HouseDTO.Summary result = houseService.getHouseSummary(1L);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getMaxOccupant()).isEqualTo(4);
            assertThat(result.getCurrentOccupant()).isEqualTo(2);
        }

        @Test
        @DisplayName("getAllHouseSummaries should return all summaries")
        void getAllHouseSummaries_returnsAllSummaries() {
            // Given
            when(houseRepository.findAll()).thenReturn(List.of(testHouse));
            when(employeeServiceClient.countEmployeesByHouseId(1L)).thenReturn(2);

            // When
            List<HouseDTO.Summary> result = houseService.getAllHouseSummaries();

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCurrentOccupant()).isEqualTo(2);
        }
    }
}
