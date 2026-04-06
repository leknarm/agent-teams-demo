package com.formbuilder.service;

import com.formbuilder.dto.request.SubmitFormRequest;
import com.formbuilder.dto.response.SubmissionResponse;
import com.formbuilder.entity.Form;
import com.formbuilder.entity.FormField;
import com.formbuilder.entity.Submission;
import com.formbuilder.enums.FieldType;
import com.formbuilder.enums.FormStatus;
import com.formbuilder.exception.FormClosedException;
import com.formbuilder.exception.ResourceNotFoundException;
import com.formbuilder.mapper.SubmissionMapper;
import com.formbuilder.repository.FormRepository;
import com.formbuilder.repository.SubmissionRepository;
import com.formbuilder.exception.SubmissionValidationException;
import com.formbuilder.service.impl.SubmissionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock
    private FormRepository formRepository;

    @Mock
    private SubmissionRepository submissionRepository;

    @Spy
    private SubmissionMapper submissionMapper;

    @Mock
    private WebhookService webhookService;

    @InjectMocks
    private SubmissionServiceImpl submissionService;

    private UUID formId;
    private Form publishedForm;
    private FormField emailField;
    private FormField nameField;

    @BeforeEach
    void setUp() {
        formId = UUID.randomUUID();

        nameField = FormField.builder()
                .id(UUID.randomUUID())
                .type(FieldType.TEXT)
                .name("full_name")
                .label("Full Name")
                .fieldOrder(0)
                .required(true)
                .validationRules(List.of(
                        Map.of("type", "minLength", "value", 2, "message", "Min 2 chars")
                ))
                .build();

        emailField = FormField.builder()
                .id(UUID.randomUUID())
                .type(FieldType.EMAIL)
                .name("email")
                .label("Email")
                .fieldOrder(1)
                .required(true)
                .validationRules(new ArrayList<>())
                .build();

        Map<String, Object> settings = new HashMap<>();
        settings.put("submissionLimit", null);
        settings.put("closedMessage", "Form is closed.");

        publishedForm = Form.builder()
                .id(formId)
                .name("Contact Form")
                .status(FormStatus.PUBLISHED)
                .version(1)
                .settings(settings)
                .theme(new HashMap<>())
                .fields(new ArrayList<>(List.of(nameField, emailField)))
                .build();
        publishedForm.setCreatedAt(Instant.now());
        publishedForm.setUpdatedAt(Instant.now());
    }

    @Test
    void submitForm_shouldReturnSubmissionResponse_onValidData() {
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(publishedForm));
        when(submissionRepository.save(any(Submission.class))).thenAnswer(inv -> {
            Submission s = inv.getArgument(0);
            s.setId(UUID.randomUUID());
            s.setCreatedAt(Instant.now());
            return s;
        });

        Map<String, Object> data = Map.of(
                "full_name", "John Doe",
                "email", "john@example.com"
        );
        SubmitFormRequest request = new SubmitFormRequest(data);

        SubmissionResponse response = submissionService.submitForm(formId, request);

        assertThat(response.formId()).isEqualTo(formId);
        assertThat(response.formVersion()).isEqualTo(1);
        assertThat(response.data()).containsEntry("full_name", "John Doe");
    }

    @Test
    void submitForm_shouldThrowValidationException_whenRequiredFieldMissing() {
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(publishedForm));

        Map<String, Object> data = Map.of("email", "john@example.com");
        SubmitFormRequest request = new SubmitFormRequest(data);

        assertThatThrownBy(() -> submissionService.submitForm(formId, request))
                .isInstanceOf(SubmissionValidationException.class)
                .satisfies(ex -> {
                    SubmissionValidationException sve =
                            (SubmissionValidationException) ex;
                    assertThat(sve.getErrors()).anyMatch(e -> e.field().equals("full_name"));
                });
    }

    @Test
    void submitForm_shouldThrowValidationException_whenEmailInvalid() {
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(publishedForm));

        Map<String, Object> data = Map.of(
                "full_name", "John Doe",
                "email", "not-an-email"
        );
        SubmitFormRequest request = new SubmitFormRequest(data);

        assertThatThrownBy(() -> submissionService.submitForm(formId, request))
                .isInstanceOf(SubmissionValidationException.class)
                .satisfies(ex -> {
                    SubmissionValidationException sve =
                            (SubmissionValidationException) ex;
                    assertThat(sve.getErrors()).anyMatch(e -> e.field().equals("email"));
                });
    }

    @Test
    void submitForm_shouldThrowFormClosed_whenFormClosed() {
        publishedForm.setStatus(FormStatus.CLOSED);
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(publishedForm));

        SubmitFormRequest request = new SubmitFormRequest(Map.of("full_name", "John"));

        assertThatThrownBy(() -> submissionService.submitForm(formId, request))
                .isInstanceOf(FormClosedException.class);
    }

    @Test
    void submitForm_shouldThrowNotFound_whenFormNotPublished() {
        publishedForm.setStatus(FormStatus.DRAFT);
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(publishedForm));

        SubmitFormRequest request = new SubmitFormRequest(Map.of("full_name", "John"));

        assertThatThrownBy(() -> submissionService.submitForm(formId, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void submitForm_shouldThrowValidationException_whenMinLengthViolated() {
        when(formRepository.findByIdAndDeletedAtIsNull(formId))
                .thenReturn(Optional.of(publishedForm));

        Map<String, Object> data = Map.of(
                "full_name", "J",
                "email", "john@example.com"
        );
        SubmitFormRequest request = new SubmitFormRequest(data);

        assertThatThrownBy(() -> submissionService.submitForm(formId, request))
                .isInstanceOf(SubmissionValidationException.class)
                .satisfies(ex -> {
                    SubmissionValidationException sve =
                            (SubmissionValidationException) ex;
                    assertThat(sve.getErrors()).anyMatch(e ->
                            e.field().equals("full_name") && e.message().equals("Min 2 chars"));
                });
    }
}
