package org.example.housingservice;

import org.example.housingservice.repository.*;
import org.example.housingservice.service.FacilityReportService;
import org.example.housingservice.service.FacilityService;
import org.example.housingservice.service.HouseService;
import org.example.housingservice.service.LandlordService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Housing Service Application Tests
 */
@SpringBootTest
@ActiveProfiles("test")
class HousingServiceApplicationTests {

    @Autowired
    private LandlordRepository landlordRepository;

    @Autowired
    private HouseRepository houseRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private FacilityReportRepository facilityReportRepository;

    @Autowired
    private FacilityReportDetailRepository facilityReportDetailRepository;

    @Autowired
    private LandlordService landlordService;

    @Autowired
    private HouseService houseService;

    @Autowired
    private FacilityService facilityService;

    @Autowired
    private FacilityReportService facilityReportService;

    @Test
    void contextLoads() {
        // ValidateApplication Context LoadingSuccess
    }

    @Test
    void repositoriesAreLoaded() {
        assertThat(landlordRepository).isNotNull();
        assertThat(houseRepository).isNotNull();
        assertThat(facilityRepository).isNotNull();
        assertThat(facilityReportRepository).isNotNull();
        assertThat(facilityReportDetailRepository).isNotNull();
    }

    @Test
    void servicesAreLoaded() {
        assertThat(landlordService).isNotNull();
        assertThat(houseService).isNotNull();
        assertThat(facilityService).isNotNull();
        assertThat(facilityReportService).isNotNull();
    }
}
