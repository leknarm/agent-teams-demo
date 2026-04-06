package com.formbuilder.service.impl;

import com.formbuilder.dto.response.DailyCount;
import com.formbuilder.dto.response.FieldAnalytics;
import com.formbuilder.dto.response.FormAnalyticsResponse;
import com.formbuilder.entity.Form;
import com.formbuilder.entity.FormField;
import com.formbuilder.exception.ResourceNotFoundException;
import com.formbuilder.repository.FormRepository;
import com.formbuilder.repository.SubmissionRepository;
import com.formbuilder.repository.SubmissionValueRepository;
import com.formbuilder.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final FormRepository formRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionValueRepository submissionValueRepository;

    @Override
    @Transactional(readOnly = true)
    public FormAnalyticsResponse getFormAnalytics(UUID formId, LocalDate from, LocalDate to) {
        Form form = formRepository.findByIdAndDeletedAtIsNull(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form", formId));

        long totalSubmissions = submissionRepository.countByFormId(formId);

        Instant fromInstant = from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<Object[]> dayCounts = submissionRepository.countByDay(formId, fromInstant, toInstant);

        // Build a complete date map with zeros for missing days
        Map<LocalDate, Long> dateCountMap = new HashMap<>();
        for (Object[] row : dayCounts) {
            LocalDate date = toLocalDate(row[0]);
            Long count = ((Number) row[1]).longValue();
            if (date != null) {
                dateCountMap.put(date, count);
            }
        }

        List<DailyCount> submissionsOverTime = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            submissionsOverTime.add(new DailyCount(d, dateCountMap.getOrDefault(d, 0L)));
        }

        // Field-level analytics
        Set<String> analyticsFieldNames = form.getFields().stream()
                .filter(f -> f.getType().supportsAnalytics())
                .map(FormField::getName)
                .collect(Collectors.toSet());

        Map<String, String> fieldTypeByName = form.getFields().stream()
                .filter(f -> f.getType().supportsAnalytics())
                .collect(Collectors.toMap(FormField::getName, f -> f.getType().name()));

        Map<String, FieldAnalytics> fieldAnalytics = new LinkedHashMap<>();

        if (!analyticsFieldNames.isEmpty()) {
            List<Object[]> valueCounts = submissionValueRepository.countValuesByField(formId);

            // Group by fieldName
            Map<String, Map<String, Long>> grouped = new HashMap<>();
            for (Object[] row : valueCounts) {
                String fieldName = (String) row[0];
                String value = (String) row[1];
                Long count = ((Number) row[2]).longValue();

                if (analyticsFieldNames.contains(fieldName) && value != null) {
                    grouped.computeIfAbsent(fieldName, k -> new LinkedHashMap<>())
                            .put(value, count);
                }
            }

            for (String fieldName : analyticsFieldNames) {
                Map<String, Long> counts = grouped.getOrDefault(fieldName, new LinkedHashMap<>());
                String fieldType = fieldTypeByName.get(fieldName);

                Double average = null;
                long responseCount = counts.values().stream().mapToLong(Long::longValue).sum();

                // Compute average for numeric fields
                if (isNumericFieldType(fieldType)) {
                    double weightedSum = counts.entrySet().stream()
                            .mapToDouble(e -> {
                                try {
                                    return Double.parseDouble(e.getKey()) * e.getValue();
                                } catch (NumberFormatException ex) {
                                    return 0;
                                }
                            })
                            .sum();
                    if (responseCount > 0) {
                        average = Math.round(weightedSum / responseCount * 100.0) / 100.0;
                    }
                }

                fieldAnalytics.put(fieldName, new FieldAnalytics(
                        fieldName, fieldType, counts, average, responseCount));
            }
        }

        return new FormAnalyticsResponse(formId, totalSubmissions, submissionsOverTime, fieldAnalytics);
    }

    private LocalDate toLocalDate(Object obj) {
        if (obj instanceof LocalDate ld) return ld;
        if (obj instanceof java.sql.Date sd) return sd.toLocalDate();
        if (obj instanceof String s) {
            try {
                return LocalDate.parse(s);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private boolean isNumericFieldType(String fieldType) {
        return "RATING".equals(fieldType) || "SCALE".equals(fieldType) || "NUMBER".equals(fieldType);
    }
}
