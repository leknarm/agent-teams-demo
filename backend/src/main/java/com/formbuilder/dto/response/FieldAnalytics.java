package com.formbuilder.dto.response;

import java.util.Map;

public record FieldAnalytics(
        String fieldName,
        String fieldType,
        Map<String, Long> valueCounts,
        Double average,
        Long responseCount
) {}
