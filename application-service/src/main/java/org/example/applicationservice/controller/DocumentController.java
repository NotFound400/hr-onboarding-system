package org.example.applicationservice.controller;

import com.example.common.Result;
import org.example.applicationservice.dto.DigitalDocumentDTO;
import org.example.applicationservice.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public ResponseEntity<Result<DigitalDocumentDTO>> uploadDocument(
            @RequestBody DigitalDocumentDTO request) {

        Result<DigitalDocumentDTO> result = documentService.createDocument(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getDocumentsByApplication(
            @PathVariable Long applicationId) {

        Result<List<DigitalDocumentDTO>> result = documentService.getDocumentsByApplication(applicationId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getDocumentsByEmployee(
            @PathVariable String employeeId) {

        Result<List<DigitalDocumentDTO>> result = documentService.getDocumentsByEmployee(employeeId);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{documentId}")
    public ResponseEntity<Result<DigitalDocumentDTO>> updateDocument(
            @PathVariable Long documentId,
            @RequestBody DigitalDocumentDTO request) {

        Result<DigitalDocumentDTO> result = documentService.updateDocument(documentId, request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Result<Void>> deleteDocument(@PathVariable Long documentId) {
        Result<Void> result = documentService.deleteDocument(documentId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getDocumentsByType(
            @PathVariable String type) {

        Result<List<DigitalDocumentDTO>> result = documentService.getDocumentsByType(type);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/required")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getRequiredDocuments() {
        Result<List<DigitalDocumentDTO>> result = documentService.getRequiredDocuments();
        return ResponseEntity.ok(result);
    }


}
