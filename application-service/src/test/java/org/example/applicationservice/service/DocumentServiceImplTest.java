package org.example.applicationservice.service;

import com.example.common.Result;
import org.example.applicationservice.dao.DigitalDocumentRepository;
import org.example.applicationservice.domain.DigitalDocument;
import org.example.applicationservice.dto.DigitalDocumentDTO;
import org.junit.jupiter.api.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DocumentServiceImplTest {

    @Mock
    private DigitalDocumentRepository repository;

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
        service = new DocumentServiceImpl(repository); // <-- inject mock manually
    }

    @AfterEach
    void tearDown() throws Exception {
        mocks.close();
    }

    @Test
    void testCreateDocument() {
        DigitalDocumentDTO dto = new DigitalDocumentDTO();
        dto.setType("Passport");
        dto.setIsRequired(true);
        dto.setPath("s3://bucket/passport.pdf");
        dto.setDescription("Passport scan");
        dto.setTitle("Passport");

        DigitalDocument savedDoc = new DigitalDocument();
        savedDoc.setId(1L);
        savedDoc.setType(dto.getType());
        savedDoc.setIsRequired(dto.getIsRequired());
        savedDoc.setPath(dto.getPath());
        savedDoc.setDescription(dto.getDescription());
        savedDoc.setTitle(dto.getTitle());

        when(repository.save(any(DigitalDocument.class))).thenReturn(savedDoc);

        Result<DigitalDocumentDTO> result = service.createDocument(dto);

        assertTrue(result.isSuccess());
        assertEquals(1L, result.getData().getId());
        assertEquals("Passport", result.getData().getType());

        verify(repository, times(1)).save(any(DigitalDocument.class));
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
    void testUpdateDocumentNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        DigitalDocumentDTO updateDto = new DigitalDocumentDTO();
        Result<DigitalDocumentDTO> result = service.updateDocument(1L, updateDto);

        assertFalse(result.isSuccess());
        assertEquals("Document not found with id: 1", result.getMessage());

        verify(repository, times(1)).findById(1L);
    }
}
