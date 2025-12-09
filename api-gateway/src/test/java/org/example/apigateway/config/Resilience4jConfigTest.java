package org.example.apigateway.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import io.github.resilience4j.timelimiter.TimeLimiterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Resilience4j Configuration Tests")
class Resilience4jConfigTest {

    private CircuitBreakerRegistry circuitBreakerRegistry;
    private TimeLimiterRegistry timeLimiterRegistry;

    @BeforeEach
    void setUp() {
        // Create default configurations for testing
        CircuitBreakerConfig defaultConfig = CircuitBreakerConfig.custom()
                .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                .slidingWindowSize(10)
                .minimumNumberOfCalls(5)
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .permittedNumberOfCallsInHalfOpenState(3)
                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                .build();

        circuitBreakerRegistry = CircuitBreakerRegistry.of(defaultConfig);
        timeLimiterRegistry = TimeLimiterRegistry.ofDefaults();
    }

    @Nested
    @DisplayName("Circuit Breaker Registry Tests")
    class CircuitBreakerRegistryTests {

        @Test
        @DisplayName("Should create circuit breaker with default configuration")
        void shouldCreateCircuitBreakerWithDefaultConfiguration() {
            CircuitBreaker circuitBreaker = circuitBreakerRegistry.circuitBreaker("testService");

            assertThat(circuitBreaker).isNotNull();
            assertThat(circuitBreaker.getName()).isEqualTo("testService");
        }

        @Test
        @DisplayName("Should create multiple circuit breakers for different services")
        void shouldCreateMultipleCircuitBreakers() {
            CircuitBreaker authCircuitBreaker = circuitBreakerRegistry.circuitBreaker("authService");
            CircuitBreaker employeeCircuitBreaker = circuitBreakerRegistry.circuitBreaker("employeeService");

            assertThat(authCircuitBreaker.getName()).isEqualTo("authService");
            assertThat(employeeCircuitBreaker.getName()).isEqualTo("employeeService");
            assertThat(authCircuitBreaker).isNotSameAs(employeeCircuitBreaker);
        }

        @Test
        @DisplayName("Should return same circuit breaker for same service name")
        void shouldReturnSameCircuitBreakerForSameName() {
            CircuitBreaker first = circuitBreakerRegistry.circuitBreaker("sameService");
            CircuitBreaker second = circuitBreakerRegistry.circuitBreaker("sameService");

            assertThat(first).isSameAs(second);
        }
    }

    @Nested
    @DisplayName("Circuit Breaker State Tests")
    class CircuitBreakerStateTests {

        @Test
        @DisplayName("Circuit breaker should start in CLOSED state")
        void circuitBreakerShouldStartInClosedState() {
            CircuitBreaker circuitBreaker = circuitBreakerRegistry.circuitBreaker("newService");

            assertThat(circuitBreaker.getState()).isEqualTo(CircuitBreaker.State.CLOSED);
        }

        @Test
        @DisplayName("Circuit breaker metrics should be initialized")
        void circuitBreakerMetricsShouldBeInitialized() {
            CircuitBreaker circuitBreaker = circuitBreakerRegistry.circuitBreaker("metricsService");

            assertThat(circuitBreaker.getMetrics()).isNotNull();
            assertThat(circuitBreaker.getMetrics().getNumberOfSuccessfulCalls()).isZero();
            assertThat(circuitBreaker.getMetrics().getNumberOfFailedCalls()).isZero();
        }
    }

    @Nested
    @DisplayName("Circuit Breaker Configuration Tests")
    class CircuitBreakerConfigurationTests {

        @Test
        @DisplayName("Should have correct sliding window size")
        void shouldHaveCorrectSlidingWindowSize() {
            CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                    .slidingWindowSize(10)
                    .build();

            assertThat(config.getSlidingWindowSize()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should have correct failure rate threshold")
        void shouldHaveCorrectFailureRateThreshold() {
            CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                    .failureRateThreshold(50)
                    .build();

            assertThat(config.getFailureRateThreshold()).isEqualTo(50);
        }

        @Test
        @DisplayName("Should have correct wait duration in open state")
        void shouldHaveCorrectWaitDurationInOpenState() {
            CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                    .waitDurationInOpenState(Duration.ofSeconds(30))
                    .build();

            Long actualDurationMillis = config.getWaitIntervalFunctionInOpenState().apply(1);

            assertThat(actualDurationMillis).isEqualTo(Duration.ofSeconds(30).toMillis());
        }

        @Test
        @DisplayName("Should have automatic transition enabled")
        void shouldHaveAutomaticTransitionEnabled() {
            CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                    .automaticTransitionFromOpenToHalfOpenEnabled(true)
                    .build();

            assertThat(config.isAutomaticTransitionFromOpenToHalfOpenEnabled()).isTrue();
        }
    }

    @Nested
    @DisplayName("Time Limiter Configuration Tests")
    class TimeLimiterConfigurationTests {

        @Test
        @DisplayName("Should create time limiter with default configuration")
        void shouldCreateTimeLimiterWithDefaultConfiguration() {
            var timeLimiter = timeLimiterRegistry.timeLimiter("testService");

            assertThat(timeLimiter).isNotNull();
            assertThat(timeLimiter.getName()).isEqualTo("testService");
        }

        @Test
        @DisplayName("Should have correct timeout duration")
        void shouldHaveCorrectTimeoutDuration() {
            TimeLimiterConfig config = TimeLimiterConfig.custom()
                    .timeoutDuration(Duration.ofSeconds(10))
                    .build();

            assertThat(config.getTimeoutDuration()).isEqualTo(Duration.ofSeconds(10));
        }

        @Test
        @DisplayName("Should have cancel running future setting")
        void shouldHaveCancelRunningFutureSetting() {
            TimeLimiterConfig config = TimeLimiterConfig.custom()
                    .cancelRunningFuture(true)
                    .build();

            assertThat(config.shouldCancelRunningFuture()).isTrue();
        }
    }

    @Nested
    @DisplayName("Service-Specific Configuration Tests")
    class ServiceSpecificConfigurationTests {

        @Test
        @DisplayName("Auth service should have custom configuration")
        void authServiceShouldHaveCustomConfiguration() {
            CircuitBreakerConfig authConfig = CircuitBreakerConfig.custom()
                    .slidingWindowSize(5)
                    .failureRateThreshold(40)
                    .waitDurationInOpenState(Duration.ofSeconds(20))
                    .build();

            Long actualDurationMillis = authConfig.getWaitIntervalFunctionInOpenState().apply(1);

            assertThat(authConfig.getSlidingWindowSize()).isEqualTo(5);
            assertThat(authConfig.getFailureRateThreshold()).isEqualTo(40);
            assertThat(actualDurationMillis).isEqualTo(Duration.ofSeconds(20).toMillis());
        }

        @Test
        @DisplayName("Employee service should use time-based sliding window")
        void employeeServiceShouldUseTimeBasedSlidingWindow() {
            CircuitBreakerConfig employeeConfig = CircuitBreakerConfig.custom()
                    .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.TIME_BASED)
                    .slidingWindowSize(60)
                    .failureRateThreshold(50)
                    .build();

            assertThat(employeeConfig.getSlidingWindowType())
                    .isEqualTo(CircuitBreakerConfig.SlidingWindowType.TIME_BASED);
        }

        @Test
        @DisplayName("Housing service should have standard configuration")
        void housingServiceShouldHaveStandardConfiguration() {
            CircuitBreakerConfig housingConfig = CircuitBreakerConfig.custom()
                    .slidingWindowSize(10)
                    .failureRateThreshold(50)
                    .waitDurationInOpenState(Duration.ofSeconds(30))
                    .build();

            assertThat(housingConfig.getSlidingWindowSize()).isEqualTo(10);
            assertThat(housingConfig.getFailureRateThreshold()).isEqualTo(50);
        }
    }
}
