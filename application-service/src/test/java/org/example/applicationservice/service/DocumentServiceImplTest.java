package org.example.applicationservice.service;

import com.example.common.Result;
import org.example.applicationservice.dao.ApplicationWorkFlowRepository;
import org.example.applicationservice.dao.DigitalDocumentRepository;
import org.example.applicationservice.domain.ApplicationWorkFlow;
import org.example.applicationservice.domain.DigitalDocument;
import org.example.applicationservice.dto.DigitalDocumentDTO;
import org.junit.jupiter.api.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import software.amazon.awssdk.services.s3.S3Client;
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

}
