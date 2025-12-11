package org.example.applicationservice.service;

import org.example.applicationservice.utils.*;
import org.example.applicationservice.domain.DigitalDocument;
import org.example.applicationservice.dto.DigitalDocumentDTO;
import org.example.applicationservice.dto.UploadDocumentRequest;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface DocumentService {
    Result<List<DigitalDocumentDTO>> getDocumentsByApplication(Long applicationId);
    Result<List<DigitalDocumentDTO>> getDocumentsByEmployee(String employeeID);
    Result<List<DigitalDocumentDTO>> getDocumentsByType(String type);
    Result<List<DigitalDocumentDTO>> getRequiredDocuments();
    DigitalDocumentDTO uploadDocument(MultipartFile file, UploadDocumentRequest request);
    byte[] downloadDocumentById(Long documentId);
    DigitalDocument getDocumentEntityById(Long id);
    void deleteDocumentById(Long documentId);
    public DigitalDocumentDTO updateDocument(Long id, MultipartFile file, UploadDocumentRequest request) throws IOException;

}
