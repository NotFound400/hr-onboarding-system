package org.example.applicationservice.service;

import com.example.common.Result;
import org.example.applicationservice.dao.ApplicationWorkFlowRepository;
import org.example.applicationservice.dao.DigitalDocumentRepository;
import org.example.applicationservice.domain.ApplicationWorkFlow;
import org.example.applicationservice.domain.DigitalDocument;
import org.example.applicationservice.dto.DigitalDocumentDTO;
import org.example.applicationservice.dto.UploadDocumentRequest;
import org.example.applicationservice.exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DigitalDocumentRepository repository;
    private final S3Client s3Client;
    private final ApplicationWorkFlowRepository applicationRepository;
    @Value("${aws.bucket.name}")
    private String bucketName;
    @Value("${cloud.aws.region}")
    private String region;

    public DocumentServiceImpl(DigitalDocumentRepository repository, S3Client s3Client, ApplicationWorkFlowRepository applicationRepository) {
        this.repository = repository;
        this.s3Client = s3Client;
        this.applicationRepository = applicationRepository;
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
                        doc.getTitle(),
                        doc.getApplication().getId()
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
                        doc.getTitle(),
                        doc.getApplication().getId()
                ))
                .collect(Collectors.toList());

        return Result.success(dtos);
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
                        doc.getTitle(),
                        doc.getApplication().getId()
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
                        doc.getTitle(),
                        doc.getApplication().getId()
                ))
                .collect(Collectors.toList());

        return Result.success(dtos);
    }

    @Override
    public DigitalDocumentDTO uploadDocument(MultipartFile file, UploadDocumentRequest request) {
        try {
            // 1. Generate S3 key (filename in bucket)
            String key = "documents/" + request.getApplicationId() + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

            // 2. Upload to S3
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 3. Construct S3 URL
            String s3Url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;

            // 4. Fetch ApplicationWorkFlow
            ApplicationWorkFlow application = applicationRepository.findById(request.getApplicationId())
                    .orElseThrow(() -> new EntityNotFoundException("Application not found"));

            // 5. Save DigitalDocument entity
            DigitalDocument doc = new DigitalDocument();
            doc.setApplication(application);
            doc.setType(request.getType());
            doc.setTitle(request.getTitle());
            doc.setDescription(request.getDescription());
            doc.setPath(s3Url);
            doc.setIsRequired(false);

            DigitalDocument saved = repository.save(doc);

            // 6. Return DTO
            return new DigitalDocumentDTO(saved.getId(),
                    saved.getType(),
                    saved.getIsRequired(),
                    saved.getPath(),
                    saved.getDescription(),
                    saved.getTitle(),
                    saved.getApplication().getId());

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload document", e);
        }
    }

    @Override
    public byte[] downloadDocumentById(Long documentId) {
        // 1. Fetch document entity
        DigitalDocument doc = repository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));

        // 2. Extract S3 key from URL (assuming you stored full S3 URL in doc.getPath())
        String s3Url = doc.getPath();
        String key = s3Url.substring(s3Url.indexOf(".com/") + 5); // everything after ".com/"

        // 3. Download file from S3
        return s3Client.getObjectAsBytes(GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build())
                .asByteArray();
    }

    public DigitalDocument getDocumentEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));
    }

    @Override
    public void deleteDocumentById(Long documentId) {

        // 1. Fetch entity
        DigitalDocument doc = repository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));

        // 2. Extract S3 key
        String s3Url = doc.getPath();
        String key = s3Url.substring(s3Url.indexOf(".com/") + 5);

        // 3. Delete from S3
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build());

        // 4. Delete entity from DB
        repository.delete(doc);
    }

    @Override
    public DigitalDocumentDTO updateDocument(Long id, MultipartFile file, UploadDocumentRequest request) throws IOException {

        // 1. Find existing document
        DigitalDocument doc = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + id));

        // 2. Extract S3 key from existing path
        String s3Url = doc.getPath();
        String key = s3Url.substring(s3Url.indexOf(".com/") + 5);

        // 3. Overwrite file in S3
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );

        // 4. Update metadata fields from DTO/request
        doc.setTitle(request.getTitle());
        doc.setDescription(request.getDescription());
        doc.setType(request.getType());

        // 5. Save updated entity
        DigitalDocument saved = repository.save(doc);

        // 6. Convert to DTO manually (no mapper)
        DigitalDocumentDTO dto = new DigitalDocumentDTO();
        dto.setId(saved.getId());
        dto.setTitle(saved.getTitle());
        dto.setDescription(saved.getDescription());
        dto.setType(saved.getType());
        dto.setPath(saved.getPath());
        dto.setIsRequired(saved.getIsRequired());
        dto.setApplicationId(saved.getApplication().getId());

        return dto;
    }

}
