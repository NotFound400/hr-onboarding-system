package org.example.emailservice.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${email.queues.registration}")
    private String registrationQueue;

    @Value("${email.queues.application-status}")
    private String applicationStatusQueue;

    @Value("${email.queues.opt-update}")
    private String optUpdateQueue;

    @Value("${email.queues.facility-report}")
    private String facilityReportQueue;

    @Bean
    public Queue registrationQueue() {
        return new Queue(registrationQueue, true);
    }

    @Bean
    public Queue applicationStatusQueue() {
        return new Queue(applicationStatusQueue, true);
    }

    @Bean
    public Queue optUpdateQueue() {
        return new Queue(optUpdateQueue, true);
    }

    @Bean
    public Queue facilityReportQueue() {
        return new Queue(facilityReportQueue, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}