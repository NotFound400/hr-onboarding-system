package org.example.applicationservice.service;

import com.example.common.Result;
import org.example.applicationservice.dao.ApplicationWorkFlowRepository;
import org.example.applicationservice.dao.DigitalDocumentRepository;
import org.example.applicationservice.domain.ApplicationWorkFlow;
import org.example.applicationservice.domain.DigitalDocument;
import org.example.applicationservice.dto.DigitalDocumentDTO;
import org.example.applicationservice.dto.UploadDocumentRequest;
import org.junit.jupiter.api.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DocumentServiceImplTest {

    @Mock
    private DigitalDocumentRepository repository;
    @Mock
    private S3Client s3Client;
    @Mock
    private ApplicationWorkFlowRepository applicationRepository;

    private DocumentServiceImpl service;

    private AutoCloseable mocks;

    @BeforeAll
    void beforeAll() {
        System.out.println("Starting DocumentServiceImpl tests...");
    }

    @AfterAll
    void afterAll() {
        System.out.println("Finished DocumentServiceImpl tests.");
    }

    @BeforeEach
    void setUp() {
        mocks = MockitoAnnotations.openMocks(this);
        service = new DocumentServiceImpl(repository, s3Client, applicationRepository); // <-- inject mock manually
    }

    @AfterEach
    void tearDown() throws Exception {
        mocks.close();
    }

    @Test
    void testGetDocumentsByType() {
        DigitalDocument doc = new DigitalDocument();
        doc.setId(1L);
        doc.setType("Passport");
        doc.setIsRequired(true);
        doc.setPath("s3://bucket/passport.pdf");
        doc.setDescription("Passport scan");
        doc.setTitle("Passport");
        ApplicationWorkFlow app = new ApplicationWorkFlow();
        app.setId(10L);  // any test ID
        doc.setApplication(app);

        when(repository.findByType("Passport")).thenReturn(Arrays.asList(doc));

        Result<List<DigitalDocumentDTO>> result = service.getDocumentsByType("Passport");

        assertTrue(result.isSuccess());
        assertNotNull(result.getData());
        assertEquals(1, result.getData().size());
        assertEquals(1L, result.getData().get(0).getId());
        assertEquals("Passport", result.getData().get(0).getType());

        verify(repository, times(1)).findByType("Passport");
    }

    @Test
    void testGetDocumentsByApplication() {
        DigitalDocument doc = new DigitalDocument();
        doc.setId(1L);
        doc.setType("ID Card");
        doc.setIsRequired(false);
        doc.setPath("url");
        doc.setDescription("desc");
        doc.setTitle("ID");
        ApplicationWorkFlow app = new ApplicationWorkFlow();
        app.setId(20L);
        doc.setApplication(app);

        when(repository.findByApplicationId(20L)).thenReturn(List.of(doc));

        Result<List<DigitalDocumentDTO>> result = service.getDocumentsByApplication(20L);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getData().size());
        assertEquals("ID Card", result.getData().get(0).getType());
        assertEquals(20L, result.getData().get(0).getApplicationId());

        verify(repository, times(1)).findByApplicationId(20L);
    }

    @Test
    void testGetDocumentsByEmployee() {
        DigitalDocument doc = new DigitalDocument();
        doc.setId(2L);
        doc.setType("Resume");
        doc.setIsRequired(false);
        doc.setPath("url");
        doc.setDescription("desc");
        doc.setTitle("Resume");
        ApplicationWorkFlow app = new ApplicationWorkFlow();
        app.setId(5L);
        doc.setApplication(app);

        when(repository.findByApplicationEmployeeId("E123")).thenReturn(List.of(doc));

        Result<List<DigitalDocumentDTO>> result = service.getDocumentsByEmployee("E123");

        assertTrue(result.isSuccess());
        assertEquals(1, result.getData().size());
        assertEquals("Resume", result.getData().get(0).getType());
        assertEquals(5L, result.getData().get(0).getApplicationId());

        verify(repository, times(1)).findByApplicationEmployeeId("E123");
    }

    @Test
    void testGetRequiredDocuments() {
        DigitalDocument doc = new DigitalDocument();
        doc.setId(3L);
        doc.setType("Contract");
        doc.setIsRequired(true);
        doc.setDescription("desc");
        doc.setTitle("Contract");
        doc.setPath("url");
        ApplicationWorkFlow app = new ApplicationWorkFlow();
        app.setId(6L);
        doc.setApplication(app);

        when(repository.findByIsRequiredTrue()).thenReturn(List.of(doc));

        Result<List<DigitalDocumentDTO>> result = service.getRequiredDocuments();

        assertTrue(result.isSuccess());
        assertEquals(1, result.getData().size());
        assertEquals("Contract", result.getData().get(0).getType());
        assertTrue(result.getData().get(0).getIsRequired());

        verify(repository, times(1)).findByIsRequiredTrue();
    }

    @Test
    void testDownloadDocumentById() {
        DigitalDocument doc = new DigitalDocument();
        doc.setId(4L);
        doc.setPath("https://bucket.s3.region.amazonaws.com/documents/file.txt");

        when(repository.findById(4L)).thenReturn(Optional.of(doc));

        // Fake S3 response metadata (cannot be null)
        GetObjectResponse mockResponse = GetObjectResponse.builder().build();

        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenReturn(ResponseBytes.fromByteArray(mockResponse, "hello".getBytes()));

        byte[] result = service.downloadDocumentById(4L);

        assertNotNull(result);
        assertArrayEquals("hello".getBytes(), result);

        verify(repository).findById(4L);
        verify(s3Client).getObjectAsBytes(any(GetObjectRequest.class));
    }



    @Test
    void testGetDocumentEntityById() {
        DigitalDocument doc = new DigitalDocument();
        doc.setId(7L);

        when(repository.findById(7L)).thenReturn(Optional.of(doc));

        DigitalDocument result = service.getDocumentEntityById(7L);

        assertNotNull(result);
        assertEquals(7L, result.getId());

        verify(repository).findById(7L);
    }

    @Test
    void testDeleteDocumentById() {
        DigitalDocument doc = new DigitalDocument();
        doc.setId(8L);
        doc.setPath("https://bucket.s3.region.amazonaws.com/folder/file.pdf");

        when(repository.findById(8L)).thenReturn(Optional.of(doc));

        service.deleteDocumentById(8L);

        verify(s3Client, times(1)).deleteObject(any(DeleteObjectRequest.class));
        verify(repository, times(1)).delete(doc);
    }

    @Test
    void testUploadDocument() throws Exception {

        // Inject bucket and region for URL building
        var bucketField = DocumentServiceImpl.class.getDeclaredField("bucketName");
        bucketField.setAccessible(true);
        bucketField.set(service, "test-bucket");

        var regionField = DocumentServiceImpl.class.getDeclaredField("region");
        regionField.setAccessible(true);
        regionField.set(service, "us-east-1");

        // application exists
        ApplicationWorkFlow app = new ApplicationWorkFlow();
        app.setId(50L);

        when(applicationRepository.findById(50L))
                .thenReturn(Optional.of(app));

        // mock file
        MultipartFile file = mock(MultipartFile.class);
        when(file.getOriginalFilename()).thenReturn("test.pdf");
        when(file.getSize()).thenReturn(10L);
        when(file.getInputStream()).thenReturn(new java.io.ByteArrayInputStream("abc".getBytes()));

        // repository.save mock: sets ID
        when(repository.save(any())).thenAnswer(inv -> {
            DigitalDocument d = inv.getArgument(0);
            d.setId(999L);
            return d;
        });

        // putObject overload handling
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(null);

        UploadDocumentRequest req = new UploadDocumentRequest();
        req.setApplicationId(50L);
        req.setTitle("Doc");
        req.setDescription("Desc");
        req.setType("PDF");

        DigitalDocumentDTO result = service.uploadDocument(file, req);

        assertNotNull(result);
        assertEquals(999L, result.getId());
        assertEquals("Doc", result.getTitle());
        assertEquals("Desc", result.getDescription());
        assertEquals("PDF", result.getType());
        assertEquals(50L, result.getApplicationId());

        // verify correct overload
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
        verify(repository).save(any());
    }

}
