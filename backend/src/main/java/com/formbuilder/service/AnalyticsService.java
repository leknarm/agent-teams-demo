package com.formbuilder.service;

import com.formbuilder.dto.response.FormAnalyticsResponse;

import java.time.LocalDate;
import java.util.UUID;

public interface AnalyticsService {
    FormAnalyticsResponse getFormAnalytics(UUID formId, LocalDate from, LocalDate to);
}
