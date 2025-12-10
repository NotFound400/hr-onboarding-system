package org.example.employeeservice.service;

import lombok.RequiredArgsConstructor;
import org.example.employeeservice.exception.UpdateUserException;
import org.example.employeeservice.model.Employee;
import org.example.employeeservice.model.PersonalDocument;
import org.example.employeeservice.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3StorageService {

    private final EmployeeRepository employeeRepository;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public PersonalDocument uploadDocument(String employeeId, MultipartFile file, String title, String comment) throws IOException {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found"));

        String folderPath = "employee/";
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        // 👉 Upload file to S3
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(folderPath + fileName)
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );

        PersonalDocument doc = PersonalDocument.builder()
                .id(UUID.randomUUID().toString())
                .comment(comment)
                .path("s3://" + bucketName + "/" + folderPath + fileName)
                .title(title)
                .createDate(LocalDateTime.now())
                .build();

        if (employee.getPersonalDocument() == null) {
            employee.setPersonalDocument(new java.util.ArrayList<>());
        }
        employee.getPersonalDocument().add(doc);
        employeeRepository.save(employee);

        return doc;
    }

    public void deletePersonalDocument(String employeeId, String documentId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found"));

        if (employee.getPersonalDocument() == null ||
                employee.getPersonalDocument().isEmpty()) {
            throw new UpdateUserException("Employee has no personal documents");
        }

        PersonalDocument target = employee.getPersonalDocument().stream()
                .filter(doc -> doc.getId() != null && doc.getId().equals(documentId))
                .findFirst()
                .orElseThrow(() -> new UpdateUserException("Document not found"));

        String key = target.getPath().replace("s3://" + bucketName + "/", "");

        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build());

        employee.getPersonalDocument().remove(target);
        employeeRepository.save(employee);
    }
}
