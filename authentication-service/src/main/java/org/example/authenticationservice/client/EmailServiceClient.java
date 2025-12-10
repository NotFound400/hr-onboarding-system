package org.example.authenticationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "email-service", url = "${email.service.url:http://localhost:8085}")
public interface EmailServiceClient {

    @PostMapping("/api/email/registration")
    ApiResponse<Void> sendRegistrationEmail(@RequestBody RegistrationEmailRequest request);

    @PostMapping("/api/email/async/registration")
    ApiResponse<Void> sendRegistrationEmailAsync(@RequestBody RegistrationEmailRequest request);
}