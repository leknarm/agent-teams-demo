package com.formbuilder.dto.request;

import com.formbuilder.enums.FieldType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record FormFieldRequest(
        UUID id,

        @NotNull(message = "Field type is required")
        FieldType type,

        @NotBlank(message = "Field name must not be blank")
        @Size(max = 255, message = "Field name must be 255 characters or fewer")
        String name,

        @NotBlank(message = "Field label must not be blank")
        @Size(max = 500, message = "Field label must be 500 characters or fewer")
        String label,

        @Size(max = 500, message = "Placeholder must be 500 characters or fewer")
        String placeholder,

        @Size(max = 1000, message = "Help text must be 1000 characters or fewer")
        String helpText,

        @NotNull(message = "Field order is required")
        Integer fieldOrder,

        Integer page,
        Boolean required,
        String defaultValue,
        List<Map<String, Object>> validationRules,
        List<Map<String, Object>> options,
        Map<String, Object> config,
        Map<String, Object> visibilityRules
) {}
