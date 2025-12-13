package org.example.housingservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "email-service", url = "${email.service.url:http://localhost:8085}",
        fallback = EmailServiceClientFallback.class)
public interface EmailServiceClient {

    @PostMapping("/api/email/facility-report")
    void sendFacilityReportEmail(@RequestBody FacilityReportEmailRequest request);

    @PostMapping("/api/email/async/facility-report")
    void sendFacilityReportEmailAsync(@RequestBody FacilityReportEmailRequest request);

    record FacilityReportEmailRequest(
            String to,
            String employeeName,
            String reportTitle,
            String status
    ) {}
}