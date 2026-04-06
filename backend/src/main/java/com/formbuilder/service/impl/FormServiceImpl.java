package com.formbuilder.service.impl;

import com.formbuilder.dto.request.CreateFormRequest;
import com.formbuilder.dto.request.FormFieldRequest;
import com.formbuilder.dto.request.UpdateFormRequest;
import com.formbuilder.dto.response.FormResponse;
import com.formbuilder.dto.response.FormSummaryResponse;
import com.formbuilder.dto.response.PageResponse;
import com.formbuilder.entity.Form;
import com.formbuilder.entity.FormField;
import com.formbuilder.enums.FieldType;
import com.formbuilder.enums.FormStatus;
import com.formbuilder.exception.BusinessException;
import com.formbuilder.exception.FormClosedException;
import com.formbuilder.exception.ResourceNotFoundException;
import com.formbuilder.mapper.FormMapper;
import com.formbuilder.repository.FormRepository;
import com.formbuilder.repository.SubmissionRepository;
import com.formbuilder.service.FormService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FormServiceImpl implements FormService {

    private final FormRepository formRepository;
    private final SubmissionRepository submissionRepository;
    private final FormMapper formMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FormSummaryResponse> listForms(FormStatus status, String search, Pageable pageable) {
        Page<Form> forms;

        boolean hasStatus = status != null;
        boolean hasSearch = search != null && !search.isBlank();

        if (hasStatus && hasSearch) {
            forms = formRepository.findByStatusAndNameContainingIgnoreCase(status, search, pageable);
        } else if (hasStatus) {
            forms = formRepository.findByStatus(status, pageable);
        } else if (hasSearch) {
            forms = formRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            forms = formRepository.findAllActive(pageable);
        }

        Page<FormSummaryResponse> summaries = forms.map(form -> {
            long count = submissionRepository.countByFormId(form.getId());
            return formMapper.toSummaryResponse(form, count);
        });

        return PageResponse.from(summaries);
    }

    @Override
    @Transactional(readOnly = true)
    public FormResponse getForm(UUID id) {
        Form form = formRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form", id));
        return formMapper.toResponse(form);
    }

    @Override
    @Transactional(readOnly = true)
    public FormResponse getPublicForm(UUID id) {
        Form form = formRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form", id));

        if (form.getStatus() == FormStatus.CLOSED) {
            String closedMessage = (String) form.getSettings()
                    .getOrDefault("closedMessage", "This form is no longer accepting responses.");
            throw new FormClosedException(closedMessage);
        }

        if (form.getStatus() != FormStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Form", id);
        }

        // Build a public response with stripped settings
        return new com.formbuilder.dto.response.FormResponse(
                form.getId(),
                form.getName(),
                form.getDescription(),
                form.getStatus(),
                form.getVersion(),
                formMapper.publicSettings(form.getSettings()),
                form.getTheme(),
                form.getFields().stream().map(formMapper::toFieldResponse).toList(),
                form.getCreatedAt(),
                form.getUpdatedAt()
        );
    }

    @Override
    @Transactional
    public FormResponse createForm(CreateFormRequest request) {
        Form form = Form.builder()
                .name(request.name())
                .description(request.description())
                .status(FormStatus.DRAFT)
                .version(1)
                .settings(formMapper.defaultSettings())
                .theme(formMapper.defaultTheme())
                .fields(new ArrayList<>())
                .build();

        Form saved = formRepository.save(form);
        log.info("Created form id={} name={}", saved.getId(), saved.getName());
        return formMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public FormResponse updateForm(UUID id, UpdateFormRequest request) {
        Form form = formRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form", id));

        if (form.getStatus() == FormStatus.PUBLISHED) {
            throw new BusinessException(
                    "Cannot modify fields of a published form. Close the form first to make changes.");
        }

        validateUniqueFieldNames(request.fields());

        formMapper.updateFromRequest(form, request);
        formMapper.syncFields(form, request.fields());

        Form saved = formRepository.save(form);
        return formMapper.toResponse(saved);
    }

    /**
     * Validates that no two fields in the request share the same name.
     * Throws a 400 BusinessException instead of letting the DB unique constraint produce a 500.
     */
    private void validateUniqueFieldNames(List<FormFieldRequest> fields) {
        if (fields == null) return;
        Set<String> seen = new HashSet<>();
        for (FormFieldRequest field : fields) {
            if (field.name() != null && !seen.add(field.name().toLowerCase())) {
                throw new BusinessException(
                        "Duplicate field name '" + field.name() + "'. Field names must be unique within a form.",
                        org.springframework.http.HttpStatus.BAD_REQUEST
                );
            }
        }
    }

    @Override
    @Transactional
    public void deleteForm(UUID id) {
        Form form = formRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form", id));
        form.softDelete();
        formRepository.save(form);
        log.info("Soft-deleted form id={}", id);
    }

    @Override
    @Transactional
    public FormResponse publishForm(UUID id) {
        Form form = formRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form", id));

        if (form.getStatus() == FormStatus.PUBLISHED) {
            throw new BusinessException("Form is already published.");
        }

        boolean hasNonDisplayField = form.getFields().stream()
                .anyMatch(f -> !f.getType().isDisplayOnly());

        if (!hasNonDisplayField) {
            throw new BusinessException("Form must have at least one non-display field before publishing.");
        }

        form.setStatus(FormStatus.PUBLISHED);
        form.setVersion(form.getVersion() + 1);

        Form saved = formRepository.save(form);
        log.info("Published form id={} version={}", saved.getId(), saved.getVersion());
        return formMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public FormResponse closeForm(UUID id) {
        Form form = formRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form", id));

        if (form.getStatus() != FormStatus.PUBLISHED) {
            throw new BusinessException("Only published forms can be closed.");
        }

        form.setStatus(FormStatus.CLOSED);
        Form saved = formRepository.save(form);
        log.info("Closed form id={}", id);
        return formMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public FormResponse duplicateForm(UUID id) {
        Form original = formRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form", id));

        Form copy = Form.builder()
                .name(original.getName() + " (Copy)")
                .description(original.getDescription())
                .status(FormStatus.DRAFT)
                .version(1)
                .settings(new HashMap<>(original.getSettings()))
                .theme(new HashMap<>(original.getTheme()))
                .fields(new ArrayList<>())
                .build();

        for (FormField originalField : original.getFields()) {
            FormField fieldCopy = FormField.builder()
                    .form(copy)
                    .type(originalField.getType())
                    .name(originalField.getName())
                    .label(originalField.getLabel())
                    .placeholder(originalField.getPlaceholder())
                    .helpText(originalField.getHelpText())
                    .fieldOrder(originalField.getFieldOrder())
                    .page(originalField.getPage())
                    .required(originalField.getRequired())
                    .defaultValue(originalField.getDefaultValue())
                    .validationRules(originalField.getValidationRules() != null
                            ? new ArrayList<>(originalField.getValidationRules()) : new ArrayList<>())
                    .options(originalField.getOptions() != null
                            ? new ArrayList<>(originalField.getOptions()) : null)
                    .config(originalField.getConfig() != null
                            ? new HashMap<>(originalField.getConfig()) : new HashMap<>())
                    .visibilityRules(originalField.getVisibilityRules() != null
                            ? new HashMap<>(originalField.getVisibilityRules()) : null)
                    .build();
            copy.addField(fieldCopy);
        }

        Form saved = formRepository.save(copy);
        log.info("Duplicated form id={} to new id={}", id, saved.getId());
        return formMapper.toResponse(saved);
    }
}
