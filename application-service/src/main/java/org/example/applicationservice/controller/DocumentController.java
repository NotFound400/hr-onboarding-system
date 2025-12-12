package org.example.applicationservice.controller;

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

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    //get documents by applicationId
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getDocumentsByApplication(
            @PathVariable Long applicationId) {

        Result<List<DigitalDocumentDTO>> result = documentService.getDocumentsByApplication(applicationId);
        return ResponseEntity.ok(result);
    }

    //get documents by employeeId
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getDocumentsByEmployee(
            @PathVariable String employeeId) {

        Result<List<DigitalDocumentDTO>> result = documentService.getDocumentsByEmployee(employeeId);
        return ResponseEntity.ok(result);
    }

    //get documents by type
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/type/{type}")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getDocumentsByType(
            @PathVariable String type) {

        Result<List<DigitalDocumentDTO>> result = documentService.getDocumentsByType(type);
        return ResponseEntity.ok(result);
    }

    //get required documents
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/required")
    public ResponseEntity<Result<List<DigitalDocumentDTO>>> getRequiredDocuments() {
        Result<List<DigitalDocumentDTO>> result = documentService.getRequiredDocuments();
        return ResponseEntity.ok(result);
    }

    //upload document
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
    @PreAuthorize("hasRole('Employee')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Result<String>> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocumentById(id);
        return ResponseEntity.ok(Result.success("Document deleted successfully"));
    }

    //update document
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
