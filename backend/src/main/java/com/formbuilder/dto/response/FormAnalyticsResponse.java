package com.formbuilder.dto.response;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record FormAnalyticsResponse(
        UUID formId,
        Long totalSubmissions,
        List<DailyCount> submissionsOverTime,
        Map<String, FieldAnalytics> fieldAnalytics
) {}
