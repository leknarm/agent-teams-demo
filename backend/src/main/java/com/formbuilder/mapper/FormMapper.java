package com.formbuilder.mapper;

import com.formbuilder.dto.request.FormFieldRequest;
import com.formbuilder.dto.request.UpdateFormRequest;
import com.formbuilder.dto.response.FormFieldResponse;
import com.formbuilder.dto.response.FormResponse;
import com.formbuilder.dto.response.FormSummaryResponse;
import com.formbuilder.entity.Form;
import com.formbuilder.entity.FormField;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class FormMapper {

    /** Allowlisted keys that callers are permitted to set in form settings (MED-04). */
    private static final Set<String> ALLOWED_SETTINGS_KEYS = Set.of(
            "submitButtonText",
            "successMessage",
            "redirectUrl",
            "showAnotherResponseLink",
            "notificationEmails",
            "webhookUrl",
            "webhookHeaders",
            "closedMessage",
            "submissionLimit"
    );

    /** Allowlisted keys that callers are permitted to set in form theme. */
    private static final Set<String> ALLOWED_THEME_KEYS = Set.of(
            "primaryColor",
            "backgroundColor",
            "textColor",
            "fontFamily",
            "logoUrl",
            "backgroundImageUrl",
            "borderRadius",
            "preset"
    );

    public FormResponse toResponse(Form form) {
        return new FormResponse(
                form.getId(),
                form.getName(),
                form.getDescription(),
                form.getStatus(),
                form.getVersion(),
                form.getSettings(),
                form.getTheme(),
                form.getFields().stream().map(this::toFieldResponse).toList(),
                form.getCreatedAt(),
                form.getUpdatedAt()
        );
    }

    public FormSummaryResponse toSummaryResponse(Form form, Long submissionCount) {
        return new FormSummaryResponse(
                form.getId(),
                form.getName(),
                form.getDescription(),
                form.getStatus(),
                form.getVersion(),
                submissionCount,
                form.getCreatedAt(),
                form.getUpdatedAt()
        );
    }

    public FormFieldResponse toFieldResponse(FormField field) {
        return new FormFieldResponse(
                field.getId(),
                field.getType(),
                field.getName(),
                field.getLabel(),
                field.getPlaceholder(),
                field.getHelpText(),
                field.getFieldOrder(),
                field.getPage(),
                field.getRequired(),
                field.getDefaultValue(),
                field.getValidationRules(),
                field.getOptions(),
                field.getConfig(),
                field.getVisibilityRules()
        );
    }

    public void updateFromRequest(Form form, UpdateFormRequest request) {
        form.setName(request.name());
        form.setDescription(request.description());
        if (request.settings() != null) {
            // Merge only allowlisted keys to prevent mass assignment (MED-04)
            Map<String, Object> merged = new HashMap<>(form.getSettings());
            request.settings().forEach((key, value) -> {
                if (ALLOWED_SETTINGS_KEYS.contains(key)) {
                    merged.put(key, value);
                }
            });
            form.setSettings(merged);
        }
        if (request.theme() != null) {
            Map<String, Object> merged = new HashMap<>(form.getTheme());
            request.theme().forEach((key, value) -> {
                if (ALLOWED_THEME_KEYS.contains(key)) {
                    merged.put(key, value);
                }
            });
            form.setTheme(merged);
        }
    }

    /**
     * Syncs the field list on a form from a list of field requests.
     * - Fields with matching IDs are updated in place.
     * - Fields with no ID are created as new.
     * - Existing fields not present in the request are removed (orphan removal handles DB deletion).
     */
    public void syncFields(Form form, List<FormFieldRequest> fieldRequests) {
        if (fieldRequests == null) {
            return;
        }

        Map<UUID, FormField> existingById = form.getFields().stream()
                .filter(f -> f.getId() != null)
                .collect(Collectors.toMap(FormField::getId, f -> f));

        List<FormField> newFields = new ArrayList<>();

        for (FormFieldRequest req : fieldRequests) {
            if (req.id() != null && existingById.containsKey(req.id())) {
                FormField existing = existingById.get(req.id());
                applyFieldRequest(existing, req);
                newFields.add(existing);
            } else {
                FormField created = toNewField(form, req);
                newFields.add(created);
            }
        }

        // Replace list contents - orphan removal handles deletion of removed fields
        form.getFields().clear();
        for (FormField field : newFields) {
            field.setForm(form);
            form.getFields().add(field);
        }
    }

    private void applyFieldRequest(FormField field, FormFieldRequest req) {
        field.setType(req.type());
        field.setName(req.name());
        field.setLabel(req.label());
        field.setPlaceholder(req.placeholder());
        field.setHelpText(req.helpText());
        field.setFieldOrder(req.fieldOrder());
        field.setPage(req.page() != null ? req.page() : 0);
        field.setRequired(req.required() != null ? req.required() : false);
        field.setDefaultValue(req.defaultValue());
        field.setValidationRules(req.validationRules() != null ? req.validationRules() : new ArrayList<>());
        field.setOptions(req.options());
        field.setConfig(req.config() != null ? req.config() : new HashMap<>());
        field.setVisibilityRules(req.visibilityRules());
    }

    private FormField toNewField(Form form, FormFieldRequest req) {
        return FormField.builder()
                .form(form)
                .type(req.type())
                .name(req.name())
                .label(req.label())
                .placeholder(req.placeholder())
                .helpText(req.helpText())
                .fieldOrder(req.fieldOrder())
                .page(req.page() != null ? req.page() : 0)
                .required(req.required() != null ? req.required() : false)
                .defaultValue(req.defaultValue())
                .validationRules(req.validationRules() != null ? req.validationRules() : new ArrayList<>())
                .options(req.options())
                .config(req.config() != null ? req.config() : new HashMap<>())
                .visibilityRules(req.visibilityRules())
                .build();
    }

    public Map<String, Object> defaultSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("submitButtonText", "Submit");
        settings.put("successMessage", "Thank you for your submission!");
        settings.put("redirectUrl", null);
        settings.put("showAnotherResponseLink", false);
        settings.put("notificationEmails", new ArrayList<>());
        settings.put("webhookUrl", null);
        settings.put("webhookHeaders", new HashMap<>());
        settings.put("closedMessage", "This form is no longer accepting responses.");
        settings.put("submissionLimit", null);
        return settings;
    }

    public Map<String, Object> defaultTheme() {
        Map<String, Object> theme = new HashMap<>();
        theme.put("primaryColor", "#2563eb");
        theme.put("backgroundColor", "#ffffff");
        theme.put("textColor", "#0f172a");
        theme.put("fontFamily", "Inter");
        theme.put("logoUrl", null);
        theme.put("backgroundImageUrl", null);
        theme.put("borderRadius", "md");
        theme.put("preset", null);
        return theme;
    }

    /**
     * Returns a public-safe copy of settings with sensitive keys stripped.
     */
    public Map<String, Object> publicSettings(Map<String, Object> settings) {
        Map<String, Object> pub = new HashMap<>();
        pub.put("submitButtonText", settings.getOrDefault("submitButtonText", "Submit"));
        pub.put("successMessage", settings.getOrDefault("successMessage", "Thank you for your submission!"));
        pub.put("showAnotherResponseLink", settings.getOrDefault("showAnotherResponseLink", false));
        return pub;
    }
}
