package org.example.applicationservice.client;

import org.example.applicationservice.dto.ApplicationStatusEmailRequest;
import org.example.applicationservice.utils.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "email-service",
        url = "${email.service.url:http://localhost:8085}"
)
public interface EmailServiceClient {

    @PostMapping("/api/email/application-status")
    Result<Void> sendApplicationStatusEmail(@RequestBody ApplicationStatusEmailRequest request);

    @PostMapping("/api/email/async/application-status")
    Result<Void> sendApplicationStatusEmailAsync(@RequestBody ApplicationStatusEmailRequest request);
}