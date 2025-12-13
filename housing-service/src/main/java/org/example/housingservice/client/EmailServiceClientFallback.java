package org.example.housingservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EmailServiceClientFallback implements EmailServiceClient {

    @Override
    public void sendFacilityReportEmail(FacilityReportEmailRequest request) {
        log.warn("Fallback: Unable to send facility report email to: {}", request.to());
    }

    @Override
    public void sendFacilityReportEmailAsync(FacilityReportEmailRequest request) {
        log.warn("Fallback: Unable to queue facility report email to: {}", request.to());
    }
}