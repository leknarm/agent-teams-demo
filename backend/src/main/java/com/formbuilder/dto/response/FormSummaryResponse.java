package com.formbuilder.dto.response;

import com.formbuilder.enums.FormStatus;

import java.time.Instant;
import java.util.UUID;

public record FormSummaryResponse(
        UUID id,
        String name,
        String description,
        FormStatus status,
        Integer version,
        Long submissionCount,
        Instant createdAt,
        Instant updatedAt
) {}
