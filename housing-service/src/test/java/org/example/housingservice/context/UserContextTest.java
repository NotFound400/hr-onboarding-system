package org.example.housingservice.context;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for UserContext
 */
@DisplayName("UserContext Tests")
class UserContextTest {

    @Nested
    @DisplayName("Role Check Tests")
    class RoleCheckTests {

        @Test
        @DisplayName("isHR should return true for HR role")
        void isHR_withHRRole_returnsTrue() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("hr@test.com")
                    .roles(List.of("HR"))
                    .build();

            assertTrue(context.isHR());
        }

        @Test
        @DisplayName("isHR should return true for ROLE_HR role")
        void isHR_withRoleHR_returnsTrue() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("hr@test.com")
                    .roles(List.of("ROLE_HR"))
                    .build();

            assertTrue(context.isHR());
        }

        @Test
        @DisplayName("isHR should return false for non-HR role")
        void isHR_withoutHRRole_returnsFalse() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("employee@test.com")
                    .roles(List.of("EMPLOYEE"))
                    .build();

            assertFalse(context.isHR());
        }

        @Test
        @DisplayName("isHR should return false for null roles")
        void isHR_withNullRoles_returnsFalse() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("test@test.com")
                    .roles(null)
                    .build();

            assertFalse(context.isHR());
        }

        @Test
        @DisplayName("isEmployee should return true for EMPLOYEE role")
        void isEmployee_withEmployeeRole_returnsTrue() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("employee@test.com")
                    .roles(List.of("EMPLOYEE"))
                    .build();

            assertTrue(context.isEmployee());
        }

        @Test
        @DisplayName("isAdmin should return true for ADMIN role")
        void isAdmin_withAdminRole_returnsTrue() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("admin@test.com")
                    .roles(List.of("ADMIN"))
                    .build();

            assertTrue(context.isAdmin());
        }

        @Test
        @DisplayName("hasRole should return true for matching role")
        void hasRole_withMatchingRole_returnsTrue() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("test@test.com")
                    .roles(List.of("CUSTOM_ROLE"))
                    .build();

            assertTrue(context.hasRole("CUSTOM_ROLE"));
        }

        @Test
        @DisplayName("hasRole should work with ROLE_ prefix")
        void hasRole_withRolePrefix_returnsTrue() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("test@test.com")
                    .roles(List.of("ROLE_MANAGER"))
                    .build();

            assertTrue(context.hasRole("MANAGER"));
        }

        @Test
        @DisplayName("User with multiple roles should pass all role checks")
        void multipleRoles_shouldPassAllChecks() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("superuser@test.com")
                    .roles(List.of("HR", "EMPLOYEE", "ADMIN"))
                    .build();

            assertTrue(context.isHR());
            assertTrue(context.isEmployee());
            assertTrue(context.isAdmin());
        }
    }

    @Nested
    @DisplayName("Factory Method Tests")
    class FactoryMethodTests {

        @Test
        @DisplayName("fromHeaders should create UserContext with valid headers")
        void fromHeaders_withValidHeaders_createsContext() {
            UserContext context = UserContext.fromHeaders(123L, "user@test.com", "HR,EMPLOYEE", 1L);

            assertEquals(123L, context.getUserId());
            assertEquals("user@test.com", context.getUsername());
            assertEquals(2, context.getRoles().size());
            assertTrue(context.getRoles().contains("HR"));
            assertTrue(context.getRoles().contains("EMPLOYEE"));
            assertEquals(1L, context.getHouseId());
        }

        @Test
        @DisplayName("fromHeaders should handle empty roles header")
        void fromHeaders_withEmptyRoles_createsContextWithEmptyRoles() {
            UserContext context = UserContext.fromHeaders(123L, "user@test.com", "", 1L);

            assertEquals(123L, context.getUserId());
            assertEquals("user@test.com", context.getUsername());
            assertTrue(context.getRoles().isEmpty());
        }

        @Test
        @DisplayName("fromHeaders should handle null roles header")
        void fromHeaders_withNullRoles_createsContextWithEmptyRoles() {
            UserContext context = UserContext.fromHeaders(123L, "user@test.com", null, 1L);

            assertEquals(123L, context.getUserId());
            assertEquals("user@test.com", context.getUsername());
            assertTrue(context.getRoles().isEmpty());
        }

        @Test
        @DisplayName("fromHeaders should trim whitespace from roles")
        void fromHeaders_shouldTrimWhitespace() {
            UserContext context = UserContext.fromHeaders(123L, "user@test.com", " HR , EMPLOYEE ", 1L);

            assertEquals(2, context.getRoles().size());
            assertTrue(context.getRoles().contains("HR"));
            assertTrue(context.getRoles().contains("EMPLOYEE"));
        }

        @Test
        @DisplayName("defaultUser should create context with EMPLOYEE role")
        void defaultUser_createsEmployeeContext() {
            UserContext context = UserContext.defaultUser();

            assertEquals(1L, context.getUserId());
            assertEquals("default@test.com", context.getUsername());
            assertTrue(context.isEmployee());
            assertFalse(context.isHR());
        }

        @Test
        @DisplayName("hrUser should create context with HR role")
        void hrUser_createsHRContext() {
            UserContext context = UserContext.hrUser(100L);

            assertEquals(100L, context.getUserId());
            assertEquals("hr@test.com", context.getUsername());
            assertTrue(context.isHR());
            assertFalse(context.isEmployee());
        }

        @Test
        @DisplayName("employeeUser should create context with EMPLOYEE role")
        void employeeUser_createsEmployeeContext() {
            UserContext context = UserContext.employeeUser(200L);

            assertEquals(200L, context.getUserId());
            assertEquals("employee@test.com", context.getUsername());
            assertTrue(context.isEmployee());
            assertFalse(context.isHR());
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Role check should be case-insensitive")
        void roleCheck_shouldBeCaseInsensitive() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("test@test.com")
                    .roles(List.of("hr", "Employee", "ADMIN"))
                    .build();

            assertTrue(context.isHR());
            assertTrue(context.isEmployee());
            assertTrue(context.isAdmin());
        }

        @Test
        @DisplayName("Empty roles list should fail all role checks")
        void emptyRoles_shouldFailAllChecks() {
            UserContext context = UserContext.builder()
                    .userId(1L)
                    .username("test@test.com")
                    .roles(List.of())
                    .build();

            assertFalse(context.isHR());
            assertFalse(context.isEmployee());
            assertFalse(context.isAdmin());
            assertFalse(context.hasRole("ANY"));
        }
    }
}
