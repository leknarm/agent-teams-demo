package com.formbuilder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateFormRequest(
        @NotBlank(message = "Form name must not be blank")
        @Size(max = 255, message = "Form name must be 255 characters or fewer")
        String name,

        @Size(max = 5000, message = "Description must be 5000 characters or fewer")
        String description
) {}
