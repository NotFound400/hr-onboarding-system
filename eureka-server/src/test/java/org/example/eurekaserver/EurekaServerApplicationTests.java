package org.example.eurekaserver;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@DisplayName("Eureka Server Application Test")
class EurekaServerApplicationTests {

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    @DisplayName("Application Contest Load Test")
    void contextLoads() {

        assertThat(applicationContext).isNotNull();
    }

    @Test
    @DisplayName("Main Method Test")
    void mainMethodShouldRun() {

        EurekaServerApplication.main(new String[]{});
    }

    @Test
    @DisplayName("eurekaServerApplication Bean Test")
    void coreBeansShouldBeRegistered() {

        assertThat(applicationContext.containsBean("eurekaServerApplication")).isTrue();
    }

    @Test
    @DisplayName("Application Name Config Test")
    void applicationNameShouldBeConfigured() {
        String appName = applicationContext.getEnvironment()
                .getProperty("spring.application.name");
        assertThat(appName).isEqualTo("eureka-server");
    }

    @Test
    @DisplayName("Server Port Test")
    void serverPortShouldBe8761() {
        String port = applicationContext.getEnvironment()
                .getProperty("server.port");
        assertThat(port).isEqualTo("8761");
    }
}
