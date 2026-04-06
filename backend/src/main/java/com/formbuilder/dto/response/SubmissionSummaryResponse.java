package com.formbuilder.dto.response;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record SubmissionSummaryResponse(
        UUID id,
        Map<String, Object> data,
        Instant submittedAt
) {}
