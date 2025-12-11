package org.example.employeeservice.controller;


import org.example.employeeservice.model.PersonalDocument;
import org.example.employeeservice.service.EmployeeService;
import org.example.employeeservice.service.S3StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping()
public class EmployeeDocumentController {

    private final S3StorageService s3StorageService;

    public EmployeeDocumentController(S3StorageService s3StorageService) {
        this.s3StorageService = s3StorageService;
    }

    @PostMapping("/employees/{employeeId}/documents")
    public ResponseEntity<PersonalDocument> uploadPersonalDocument(
            @PathVariable String employeeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "comment", required = false) String comment) throws IOException {

        return ResponseEntity.ok(s3StorageService.uploadDocument(employeeId, file, title, comment));
    }
    @DeleteMapping("/employees/{employeeId}/documents/{documentId}")
    public ResponseEntity<Void> deletePersonalDocument(
            @PathVariable String employeeId,
            @PathVariable String documentId) {

        s3StorageService.deletePersonalDocument(employeeId, documentId);
        return ResponseEntity.ok().build();
    }
}
