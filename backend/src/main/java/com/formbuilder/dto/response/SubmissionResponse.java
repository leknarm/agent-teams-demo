package com.formbuilder.dto.response;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record SubmissionResponse(
        UUID id,
        UUID formId,
        Integer formVersion,
        Map<String, Object> data,
        Instant submittedAt,
        Instant createdAt
) {}
