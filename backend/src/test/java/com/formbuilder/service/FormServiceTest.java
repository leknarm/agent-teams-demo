package com.formbuilder.service;

import com.formbuilder.dto.request.CreateFormRequest;
import com.formbuilder.dto.request.UpdateFormRequest;
import com.formbuilder.dto.response.FormResponse;
import com.formbuilder.dto.response.FormSummaryResponse;
import com.formbuilder.dto.response.PageResponse;
import com.formbuilder.entity.Form;
import com.formbuilder.entity.FormField;
import com.formbuilder.enums.FieldType;
import com.formbuilder.enums.FormStatus;
import com.formbuilder.exception.BusinessException;
import com.formbuilder.exception.ResourceNotFoundException;
import com.formbuilder.mapper.FormMapper;
import com.formbuilder.repository.FormRepository;
import com.formbuilder.repository.SubmissionRepository;
import com.formbuilder.service.impl.FormServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FormServiceTest {

    @Mock
    private FormRepository formRepository;

    @Mock
    private SubmissionRepository submissionRepository;

    @Spy
    private FormMapper formMapper;

    @InjectMocks
    private FormServiceImpl formService;

    private UUID formId;
    private Form sampleForm;

    @BeforeEach
    void setUp() {
        formId = UUID.randomUUID();
        sampleForm = Form.builder()
                .id(formId)
                .name("Test Form")
                .description("A test form")
                .status(FormStatus.DRAFT)
                .version(1)
                .settings(new HashMap<>())
                .theme(new HashMap<>())
                .fields(new ArrayList<>())
                .build();
        // Set timestamps manually since @CreationTimestamp won't fire in unit tests
        sampleForm.setCreatedAt(Instant.now());
        sampleForm.setUpdatedAt(Instant.now());
    }

    @Test
    void createForm_shouldReturnFormResponse() {
        CreateFormRequest request = new CreateFormRequest("Test Form", "A test form");
        when(formRepository.save(any(Form.class))).thenAnswer(inv -> {
            Form f = inv.getArgument(0);
            f.setId(UUID.randomUUID());
            f.setCreatedAt(Instant.now());
            f.setUpdatedAt(Instant.now());
            return f;
        });

        FormResponse response = formService.createForm(request);

        assertThat(response.name()).isEqualTo("Test Form");
        assertThat(response.status()).isEqualTo(FormStatus.DRAFT);
        assertThat(response.version()).isEqualTo(1);
        verify(formRepository).save(any(Form.class));
    }

    @Test
    void getForm_shouldReturnFormResponse_whenExists() {
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(sampleForm));

        FormResponse response = formService.getForm(formId);

        assertThat(response.id()).isEqualTo(formId);
        assertThat(response.name()).isEqualTo("Test Form");
    }

    @Test
    void getForm_shouldThrowNotFound_whenNotExists() {
        when(formRepository.findByIdAndDeletedAtIsNull(formId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> formService.getForm(formId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateForm_shouldThrowBusinessException_whenPublished() {
        sampleForm.setStatus(FormStatus.PUBLISHED);
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(sampleForm));

        UpdateFormRequest request = new UpdateFormRequest(
                "Updated Name", null, null, null, null);

        assertThatThrownBy(() -> formService.updateForm(formId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("published");
    }

    @Test
    void publishForm_shouldIncrementVersion_andSetPublished() {
        FormField field = FormField.builder()
                .id(UUID.randomUUID())
                .type(FieldType.TEXT)
                .name("name_field")
                .label("Name")
                .fieldOrder(0)
                .required(false)
                .build();
        sampleForm.getFields().add(field);

        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(sampleForm));
        when(formRepository.save(any(Form.class))).thenReturn(sampleForm);

        FormResponse response = formService.publishForm(formId);

        assertThat(response.status()).isEqualTo(FormStatus.PUBLISHED);
        assertThat(response.version()).isEqualTo(2);
    }

    @Test
    void publishForm_shouldThrowBusinessException_whenNoFields() {
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(sampleForm));

        assertThatThrownBy(() -> formService.publishForm(formId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("at least one non-display field");
    }

    @Test
    void publishForm_shouldThrowBusinessException_whenAlreadyPublished() {
        sampleForm.setStatus(FormStatus.PUBLISHED);
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(sampleForm));

        assertThatThrownBy(() -> formService.publishForm(formId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already published");
    }

    @Test
    void closeForm_shouldSetStatusClosed() {
        sampleForm.setStatus(FormStatus.PUBLISHED);
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(sampleForm));
        when(formRepository.save(any(Form.class))).thenReturn(sampleForm);

        FormResponse response = formService.closeForm(formId);

        assertThat(response.status()).isEqualTo(FormStatus.CLOSED);
    }

    @Test
    void closeForm_shouldThrowBusinessException_whenNotPublished() {
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(sampleForm));

        assertThatThrownBy(() -> formService.closeForm(formId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Only published forms");
    }

    @Test
    void deleteForm_shouldSetDeletedAt() {
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(sampleForm));
        when(formRepository.save(any(Form.class))).thenReturn(sampleForm);

        formService.deleteForm(formId);

        assertThat(sampleForm.getDeletedAt()).isNotNull();
        verify(formRepository).save(sampleForm);
    }

    @Test
    void duplicateForm_shouldCreateCopyWithDraftStatus() {
        FormField field = FormField.builder()
                .id(UUID.randomUUID())
                .type(FieldType.TEXT)
                .name("field1")
                .label("Field One")
                .fieldOrder(0)
                .required(false)
                .build();
        sampleForm.getFields().add(field);

        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(sampleForm));
        when(formRepository.save(any(Form.class))).thenAnswer(inv -> {
            Form f = inv.getArgument(0);
            f.setId(UUID.randomUUID());
            f.setCreatedAt(Instant.now());
            f.setUpdatedAt(Instant.now());
            return f;
        });

        FormResponse response = formService.duplicateForm(formId);

        assertThat(response.name()).isEqualTo("Test Form (Copy)");
        assertThat(response.status()).isEqualTo(FormStatus.DRAFT);
        assertThat(response.version()).isEqualTo(1);
        assertThat(response.fields()).hasSize(1);
    }

    @Test
    void listForms_shouldReturnPageResponse() {
        when(formRepository.findAllActive(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleForm)));
        when(submissionRepository.countByFormId(formId)).thenReturn(5L);

        PageResponse<FormSummaryResponse> result = formService.listForms(null, null, Pageable.unpaged());

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).submissionCount()).isEqualTo(5L);
    }
}
