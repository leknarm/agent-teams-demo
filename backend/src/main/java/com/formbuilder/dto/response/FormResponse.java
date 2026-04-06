package com.formbuilder.dto.response;

import com.formbuilder.enums.FormStatus;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record FormResponse(
        UUID id,
        String name,
        String description,
        FormStatus status,
        Integer version,
        Map<String, Object> settings,
        Map<String, Object> theme,
        List<FormFieldResponse> fields,
        Instant createdAt,
        Instant updatedAt
) {}
