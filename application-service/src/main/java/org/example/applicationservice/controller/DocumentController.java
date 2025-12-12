package org.example.applicationservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.applicationservice.utils.*;
import org.example.applicationservice.domain.DigitalDocument;
import org.example.applicationservice.dto.DigitalDocumentDTO;
import org.example.applicationservice.dto.UploadDocumentRequest;
import org.example.applicationservice.service.DocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;

@Tag(name = "Document Management", description = "APIs for managing documents related to applications")
@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    //get documents by applicationId
    @Operation(summary = "Get documents by application ID", description = "Retrieve all documents for a specific application")
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getDocumentsByApplication(
            @PathVariable Long applicationId) {

        Result<List<DigitalDocumentDTO>> result = documentService.getDocumentsByApplication(applicationId);
        return ResponseEntity.ok(result);
    }

    //get documents by employeeId
    @Operation(summary = "Get documents by employee ID", description = "Retrieve all documents uploaded by a specific employee")
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getDocumentsByEmployee(
            @PathVariable String employeeId) {

        Result<List<DigitalDocumentDTO>> result = documentService.getDocumentsByEmployee(employeeId);
        return ResponseEntity.ok(result);
    }

    //get documents by type
    @Operation(summary = "Get documents by type", description = "Retrieve all documents of a given type")
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/type/{type}")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getDocumentsByType(
            @PathVariable String type) {

        Result<List<DigitalDocumentDTO>> result = documentService.getDocumentsByType(type);
        return ResponseEntity.ok(result);
    }

    //get required documents
    @Operation(summary = "Get required documents", description = "Retrieve all required documents for submission")
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/required")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getRequiredDocuments() {
        Result<List<DigitalDocumentDTO>> result = documentService.getRequiredDocuments();
        return ResponseEntity.ok(result);
    }

    //upload document
    @Operation(summary = "Upload a document", description = "Upload a document with metadata")
    @PreAuthorize("hasRole('Employee')")
    @PostMapping("/upload")
    public ResponseEntity<Result<DigitalDocumentDTO>> uploadDocument(
            @RequestPart("file") MultipartFile file,
            @RequestParam("metadata") String metadataJson) {
        UploadDocumentRequest request = new ObjectMapper().readValue(metadataJson, UploadDocumentRequest.class);
        DigitalDocumentDTO dto = documentService.uploadDocument(file, request);
        return ResponseEntity.ok(Result.success(dto));
    }

    //download by documentId
    @Operation(summary = "Download a document", description = "Download a document by document ID")
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        byte[] data = documentService.downloadDocumentById(id);
        DigitalDocument doc = documentService.getDocumentEntityById(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getTitle() + "\"")
                .contentLength(data.length)
                .body(data);
    }

    //delete document by documentId
    @Operation(summary = "Delete a document", description = "Delete a document by document ID")
    @PreAuthorize("hasRole('Employee')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Result<String>> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocumentById(id);
        return ResponseEntity.ok(Result.success("Document deleted successfully"));
    }

    //update document
    @Operation(summary = "Update a document", description = "Update a document file and/or metadata by document ID")
    @PreAuthorize("hasRole('Employee')")
    @PutMapping("/update/{id}")
    public ResponseEntity<Result<DigitalDocumentDTO>> updateDocument(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @RequestParam("metadata") String metadataJson) throws IOException {

        UploadDocumentRequest request =
                new ObjectMapper().readValue(metadataJson, UploadDocumentRequest.class);

        DigitalDocumentDTO dto = documentService.updateDocument(id, file, request);

        return ResponseEntity.ok(Result.success(dto));
    }

}
