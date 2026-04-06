package com.formbuilder.service.impl;

import com.formbuilder.dto.request.SubmitFormRequest;
import com.formbuilder.dto.response.PageResponse;
import com.formbuilder.dto.response.SubmissionResponse;
import com.formbuilder.dto.response.SubmissionSummaryResponse;
import com.formbuilder.entity.Form;
import com.formbuilder.entity.FormField;
import com.formbuilder.entity.Submission;
import com.formbuilder.entity.SubmissionValue;
import com.formbuilder.enums.FieldType;
import com.formbuilder.enums.FormStatus;
import com.formbuilder.exception.BusinessException;
import com.formbuilder.exception.FieldErrorDetail;
import com.formbuilder.exception.FormClosedException;
import com.formbuilder.exception.ResourceNotFoundException;
import com.formbuilder.exception.SubmissionValidationException;
import com.formbuilder.mapper.SubmissionMapper;
import com.formbuilder.repository.FormRepository;
import com.formbuilder.repository.SubmissionRepository;
import com.formbuilder.service.SubmissionService;
import com.formbuilder.service.WebhookService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionServiceImpl implements SubmissionService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern URL_PATTERN =
            Pattern.compile("^https?://[^\\s/$.?#].[^\\s]*$", Pattern.CASE_INSENSITIVE);

    /** Dedicated thread pool for regex evaluation with timeout to prevent ReDoS. */
    private static final ExecutorService REGEX_EXECUTOR =
            Executors.newCachedThreadPool(r -> {
                Thread t = new Thread(r, "regex-eval");
                t.setDaemon(true);
                return t;
            });

    private final FormRepository formRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionMapper submissionMapper;
    private final WebhookService webhookService;

    @Override
    @Transactional
    public SubmissionResponse submitForm(UUID formId, SubmitFormRequest request) {
        Form form = formRepository.findByIdAndDeletedAtIsNull(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form", formId));

        if (form.getStatus() == FormStatus.CLOSED) {
            String closedMessage = (String) form.getSettings()
                    .getOrDefault("closedMessage", "This form is no longer accepting responses.");
            throw new FormClosedException(closedMessage);
        }

        if (form.getStatus() != FormStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Form", formId);
        }

        // Check submission limit
        Object limitObj = form.getSettings().get("submissionLimit");
        if (limitObj instanceof Number limit) {
            long currentCount = submissionRepository.countByFormId(formId);
            if (currentCount >= limit.longValue()) {
                throw new BusinessException("Submission limit reached for this form.",
                        HttpStatus.UNPROCESSABLE_ENTITY);
            }
        }

        // Dynamic validation
        List<FieldErrorDetail> errors = validateSubmission(form, request.data());
        if (!errors.isEmpty()) {
            throw new SubmissionValidationException(errors);
        }

        // Build submission
        Submission submission = Submission.builder()
                .form(form)
                .formVersion(form.getVersion())
                .data(request.data())
                .build();

        // Build normalized submission values
        Map<String, FormField> fieldsByName = new HashMap<>();
        for (FormField field : form.getFields()) {
            fieldsByName.put(field.getName(), field);
        }

        for (Map.Entry<String, Object> entry : request.data().entrySet()) {
            String fieldName = entry.getKey();
            Object rawValue = entry.getValue();
            String valueStr = rawValue != null ? rawValue.toString() : null;

            FormField field = fieldsByName.get(fieldName);
            SubmissionValue sv = SubmissionValue.builder()
                    .fieldName(fieldName)
                    .field(field)
                    .value(valueStr)
                    .build();
            submission.addValue(sv);
        }

        Submission saved = submissionRepository.save(submission);
        log.info("Saved submission id={} for form id={}", saved.getId(), formId);

        webhookService.deliverWebhook(form, saved);

        return submissionMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SubmissionSummaryResponse> listSubmissions(UUID formId, Pageable pageable) {
        formRepository.findByIdAndDeletedAtIsNull(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form", formId));

        Page<SubmissionSummaryResponse> page = submissionRepository
                .findByFormId(formId, pageable)
                .map(submissionMapper::toSummaryResponse);

        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmission(UUID submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", submissionId));
        return submissionMapper.toResponse(submission);
    }

    @Override
    @Transactional
    public void deleteSubmission(UUID submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", submissionId));
        submissionRepository.delete(submission);
    }

    @Override
    @Transactional
    public void bulkDeleteSubmissions(UUID formId, List<UUID> ids) {
        formRepository.findByIdAndDeletedAtIsNull(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form", formId));
        // Constrain deletion to submissions that actually belong to this form (MED-03)
        submissionRepository.deleteByIdInAndFormId(ids, formId);
    }

    @Override
    @Transactional(readOnly = true)
    public void exportCsv(UUID formId, HttpServletResponse response) throws IOException {
        Form form = formRepository.findByIdAndDeletedAtIsNull(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form", formId));

        List<Submission> submissions = submissionRepository.findByFormIdOrderBySubmittedAtDesc(formId);
        List<FormField> fields = form.getFields().stream()
                .filter(f -> !f.getType().isDisplayOnly())
                .sorted((a, b) -> {
                    int pageComp = Integer.compare(a.getPage(), b.getPage());
                    return pageComp != 0 ? pageComp : Integer.compare(a.getFieldOrder(), b.getFieldOrder());
                })
                .toList();

        String safeFormName = form.getName().replaceAll("[^a-zA-Z0-9-_]", "-").toLowerCase();
        String date = LocalDate.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_LOCAL_DATE);
        String filename = safeFormName + "-submissions-" + date + ".csv";

        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        // UTF-8 BOM for Excel compatibility
        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        response.getOutputStream().write(bom);

        PrintWriter writer = new PrintWriter(
                new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8));

        // Header row
        List<String> headers = new ArrayList<>();
        headers.add("Submission ID");
        headers.add("Submitted At");
        for (FormField field : fields) {
            headers.add(field.getLabel());
        }
        writer.println(toCsvRow(headers));

        // Data rows
        for (Submission submission : submissions) {
            List<String> row = new ArrayList<>();
            row.add(submission.getId().toString());
            row.add(submission.getSubmittedAt().toString());

            Map<String, Object> data = submission.getData();
            for (FormField field : fields) {
                Object value = data.get(field.getName());
                String cellValue = "";
                if (value != null) {
                    if (field.getType() == FieldType.MULTI_SELECT && value instanceof List<?> list) {
                        cellValue = list.stream()
                                .map(Object::toString)
                                .reduce((a, b) -> a + ";" + b)
                                .orElse("");
                    } else {
                        cellValue = value.toString();
                    }
                }
                row.add(cellValue);
            }
            writer.println(toCsvRow(row));
        }

        writer.flush();
    }

    private String toCsvRow(List<String> values) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) sb.append(',');
            String val = values.get(i);
            if (val == null) val = "";
            val = sanitizeCsvValue(val);
            if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
                val = "\"" + val.replace("\"", "\"\"") + "\"";
            }
            sb.append(val);
        }
        return sb.toString();
    }

    /**
     * Prevents CSV formula injection (CWE-1236) by prefixing values that start with
     * formula-triggering characters with a single quote.
     */
    private String sanitizeCsvValue(String val) {
        if (!val.isEmpty()) {
            char first = val.charAt(0);
            if (first == '=' || first == '+' || first == '-' || first == '@'
                    || first == '\t' || first == '\r') {
                val = "'" + val;
            }
        }
        return val;
    }

    private List<FieldErrorDetail> validateSubmission(Form form, Map<String, Object> data) {
        List<FieldErrorDetail> errors = new ArrayList<>();

        for (FormField field : form.getFields()) {
            if (field.getType().isDisplayOnly()) {
                continue;
            }

            String fieldName = field.getName();
            Object value = data.get(fieldName);
            String strValue = value != null ? value.toString().trim() : null;
            // A CHECKBOX with value false is treated as not checked (empty) for required validation
            boolean isEmpty = strValue == null || strValue.isEmpty()
                    || (field.getType() == com.formbuilder.enums.FieldType.CHECKBOX
                        && "false".equalsIgnoreCase(strValue));

            // Required check
            if (Boolean.TRUE.equals(field.getRequired()) && isEmpty) {
                errors.add(new FieldErrorDetail(fieldName, "This field is required"));
                continue;
            }

            if (isEmpty) {
                continue;
            }

            // Type-specific validation
            errors.addAll(validateFieldValue(field, fieldName, strValue, value));
        }

        return errors;
    }

    private List<FieldErrorDetail> validateFieldValue(
            FormField field, String fieldName, String strValue, Object rawValue) {
        List<FieldErrorDetail> errors = new ArrayList<>();

        switch (field.getType()) {
            case EMAIL -> {
                if (!EMAIL_PATTERN.matcher(strValue).matches()) {
                    errors.add(new FieldErrorDetail(fieldName, "Please enter a valid email address"));
                }
            }
            case URL -> {
                if (!URL_PATTERN.matcher(strValue).matches()) {
                    errors.add(new FieldErrorDetail(fieldName, "Please enter a valid URL"));
                }
            }
            case NUMBER, RATING, SCALE -> {
                try {
                    double numVal = Double.parseDouble(strValue);
                    errors.addAll(applyNumericRules(field, fieldName, numVal));
                } catch (NumberFormatException e) {
                    errors.add(new FieldErrorDetail(fieldName, "Please enter a valid number"));
                }
            }
            case SELECT, RADIO -> {
                // When allowCustom is true, any value is acceptable (free-text entry)
                boolean allowCustom = field.getConfig() != null
                        && Boolean.TRUE.equals(field.getConfig().get("allowCustom"));
                if (!allowCustom && field.getOptions() != null) {
                    boolean valid = field.getOptions().stream()
                            .anyMatch(opt -> strValue.equals(opt.get("value")));
                    if (!valid) {
                        errors.add(new FieldErrorDetail(fieldName, "Invalid option selected"));
                    }
                }
            }
            case MULTI_SELECT -> {
                if (rawValue instanceof List<?> selectedList && field.getOptions() != null) {
                    List<String> validValues = field.getOptions().stream()
                            .map(opt -> (String) opt.get("value"))
                            .toList();
                    for (Object selected : selectedList) {
                        if (!validValues.contains(selected.toString())) {
                            errors.add(new FieldErrorDetail(fieldName,
                                    "Invalid option: " + selected));
                        }
                    }
                }
            }
            default -> errors.addAll(applyTextRules(field, fieldName, strValue));
        }

        return errors;
    }

    private List<FieldErrorDetail> applyTextRules(FormField field, String fieldName, String value) {
        List<FieldErrorDetail> errors = new ArrayList<>();
        if (field.getValidationRules() == null) return errors;

        for (Map<String, Object> rule : field.getValidationRules()) {
            String ruleType = (String) rule.get("type");
            Object ruleValue = rule.get("value");
            String message = (String) rule.get("message");

            switch (ruleType) {
                case "minLength" -> {
                    int min = ((Number) ruleValue).intValue();
                    if (value.length() < min) errors.add(new FieldErrorDetail(fieldName, message));
                }
                case "maxLength" -> {
                    int max = ((Number) ruleValue).intValue();
                    if (value.length() > max) errors.add(new FieldErrorDetail(fieldName, message));
                }
                case "pattern" -> {
                    if (!safePatternMatches((String) ruleValue, value)) {
                        errors.add(new FieldErrorDetail(fieldName, message));
                    }
                }
            }
        }
        return errors;
    }

    /**
     * Evaluates a user-supplied regex pattern against a value with a 500 ms timeout
     * to prevent Denial of Service via catastrophic backtracking (ReDoS, CWE-1333).
     * Returns {@code false} (treated as no-match / validation fails) if the pattern is
     * invalid or the evaluation exceeds the timeout.
     */
    private boolean safePatternMatches(String pattern, String value) {
        try {
            Pattern compiled = Pattern.compile(pattern);
            Future<Boolean> future = REGEX_EXECUTOR.submit(
                    () -> compiled.matcher(value).matches());
            return future.get(500, TimeUnit.MILLISECONDS);
        } catch (PatternSyntaxException | TimeoutException | InterruptedException | ExecutionException e) {
            log.warn("Regex evaluation failed or timed out for pattern '{}': {}", pattern, e.getMessage());
            return false;
        }
    }

    private List<FieldErrorDetail> applyNumericRules(FormField field, String fieldName, double value) {
        List<FieldErrorDetail> errors = new ArrayList<>();
        if (field.getValidationRules() == null) return errors;

        for (Map<String, Object> rule : field.getValidationRules()) {
            String ruleType = (String) rule.get("type");
            Object ruleValue = rule.get("value");
            String message = (String) rule.get("message");

            switch (ruleType) {
                case "min" -> {
                    double min = ((Number) ruleValue).doubleValue();
                    if (value < min) errors.add(new FieldErrorDetail(fieldName, message));
                }
                case "max" -> {
                    double max = ((Number) ruleValue).doubleValue();
                    if (value > max) errors.add(new FieldErrorDetail(fieldName, message));
                }
            }
        }
        return errors;
    }
}
