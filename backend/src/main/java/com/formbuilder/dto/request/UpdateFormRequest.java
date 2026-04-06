package com.formbuilder.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record UpdateFormRequest(
        @NotBlank(message = "Form name must not be blank")
        @Size(max = 255, message = "Form name must be 255 characters or fewer")
        String name,

        @Size(max = 5000, message = "Description must be 5000 characters or fewer")
        String description,

        Map<String, Object> settings,
        Map<String, Object> theme,

        @Valid
        List<FormFieldRequest> fields
) {}
