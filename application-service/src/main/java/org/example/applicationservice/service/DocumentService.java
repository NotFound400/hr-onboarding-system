package org.example.applicationservice.service;

import com.example.common.Result;
import org.example.applicationservice.domain.DigitalDocument;
import org.example.applicationservice.dto.DigitalDocumentDTO;
import java.util.List;

public interface DocumentService {
    Result<DigitalDocumentDTO> createDocument(DigitalDocumentDTO request);
    Result<List<DigitalDocumentDTO>> getDocumentsByApplication(Long applicationId);
    Result<List<DigitalDocumentDTO>> getDocumentsByEmployee(String employeeID);
    Result<DigitalDocumentDTO> updateDocument(Long documentId, DigitalDocumentDTO request);
    Result<Void> deleteDocument(Long documentId);
    Result<List<DigitalDocumentDTO>> getDocumentsByType(String type);
    Result<List<DigitalDocumentDTO>> getRequiredDocuments();
}
