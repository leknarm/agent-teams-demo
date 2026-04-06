package com.formbuilder.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record SubmitFormRequest(
        @NotNull(message = "Submission data must not be null")
        Map<String, Object> data
) {}
