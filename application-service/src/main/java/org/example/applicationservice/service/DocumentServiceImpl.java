package org.example.applicationservice.service;

import com.example.common.Result;
import org.example.applicationservice.dao.DigitalDocumentRepository;
import org.example.applicationservice.domain.DigitalDocument;
import org.example.applicationservice.dto.DigitalDocumentDTO;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DigitalDocumentRepository repository;

    public DocumentServiceImpl(DigitalDocumentRepository repository) {
        this.repository = repository;
    }

    @Override
    public Result<DigitalDocumentDTO> createDocument(DigitalDocumentDTO request) {

        DigitalDocument doc = new DigitalDocument();
        doc.setType(request.getType());
        doc.setIsRequired(request.getIsRequired());
        doc.setPath(request.getPath());         // full S3 URL from frontend
        doc.setDescription(request.getDescription());
        doc.setTitle(request.getTitle());

        DigitalDocument saved = repository.save(doc);

        DigitalDocumentDTO dto = new DigitalDocumentDTO();
        dto.setId(saved.getId());
        dto.setType(saved.getType());
        dto.setIsRequired(saved.getIsRequired());
        dto.setPath(saved.getPath());
        dto.setDescription(saved.getDescription());
        dto.setTitle(saved.getTitle());

        return Result.success(dto);
    }

    @Override
    public Result<List<DigitalDocumentDTO>> getDocumentsByApplication(Long applicationId) {
        List<DigitalDocument> documents = repository.findByApplicationId(applicationId);

        List<DigitalDocumentDTO> dtos = documents.stream()
                .map(doc -> new DigitalDocumentDTO(
                        doc.getId(),
                        doc.getType(),
                        doc.getIsRequired(),
                        doc.getPath(),
                        doc.getDescription(),
                        doc.getTitle()
                ))
                .collect(Collectors.toList());

        return Result.success(dtos);
    }

    @Override
    public Result<List<DigitalDocumentDTO>> getDocumentsByEmployee(String employeeID) {
        List<DigitalDocument> documents = repository.findByApplicationEmployeeId(employeeID);

        List<DigitalDocumentDTO> dtos = documents.stream()
                .map(doc -> new DigitalDocumentDTO(
                        doc.getId(),
                        doc.getType(),
                        doc.getIsRequired(),
                        doc.getPath(),
                        doc.getDescription(),
                        doc.getTitle()
                ))
                .collect(Collectors.toList());

        return Result.success(dtos);
    }

    @Override
    public Result<DigitalDocumentDTO> updateDocument(Long documentId, DigitalDocumentDTO request) {
        return repository.findById(documentId)
                .map(doc -> {
                    doc.setType(request.getType());
                    doc.setIsRequired(request.getIsRequired());
                    doc.setPath(request.getPath());
                    doc.setDescription(request.getDescription());
                    doc.setTitle(request.getTitle());
                    repository.save(doc);

                    // Return updated DTO
                    DigitalDocumentDTO dto = new DigitalDocumentDTO(
                            doc.getId(),
                            doc.getType(),
                            doc.getIsRequired(),
                            doc.getPath(),
                            doc.getDescription(),
                            doc.getTitle()
                    );
                    return Result.success(dto);
                })
                .orElse(Result.fail("Document not found with id: " + documentId));
    }

    @Override
    public Result<Void> deleteDocument(Long documentId) {
        return repository.findById(documentId)
                .map(doc -> {
                    // Optional: trigger S3 deletion or event
                    System.out.println("[Placeholder] Deleting file from S3: " + doc.getPath());

                    repository.delete(doc);
                    return Result.<Void>success(null);
                })
                .orElse(Result.fail("Document not found with id: " + documentId));
    }

    @Override
    public Result<List<DigitalDocumentDTO>> getDocumentsByType(String type) {
        List<DigitalDocument> documents = repository.findByType(type);

        List<DigitalDocumentDTO> dtos = documents.stream()
                .map(doc -> new DigitalDocumentDTO(
                        doc.getId(),
                        doc.getType(),
                        doc.getIsRequired(),
                        doc.getPath(),
                        doc.getDescription(),
                        doc.getTitle()
                ))
                .collect(Collectors.toList());

        return Result.success(dtos);
    }

    @Override
    public Result<List<DigitalDocumentDTO>> getRequiredDocuments() {
        List<DigitalDocument> documents = repository.findByIsRequiredTrue();

        List<DigitalDocumentDTO> dtos = documents.stream()
                .map(doc -> new DigitalDocumentDTO(
                        doc.getId(),
                        doc.getType(),
                        doc.getIsRequired(),
                        doc.getPath(),
                        doc.getDescription(),
                        doc.getTitle()
                ))
                .collect(Collectors.toList());

        return Result.success(dtos);
    }

}
