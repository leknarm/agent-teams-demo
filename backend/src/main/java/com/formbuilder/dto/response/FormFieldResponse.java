package com.formbuilder.dto.response;

import com.formbuilder.enums.FieldType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record FormFieldResponse(
        UUID id,
        FieldType type,
        String name,
        String label,
        String placeholder,
        String helpText,
        Integer fieldOrder,
        Integer page,
        Boolean required,
        String defaultValue,
        List<Map<String, Object>> validationRules,
        List<Map<String, Object>> options,
        Map<String, Object> config,
        Map<String, Object> visibilityRules
) {}
