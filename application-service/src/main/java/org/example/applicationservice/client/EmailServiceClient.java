package org.example.applicationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "email-service", url = "${email.service.url}")
public interface EmailServiceClient {
    @PostMapping("/emails/approval")
    void sendApprovalEmail(@RequestParam String employeeID,
                           @RequestParam String comment);
}
