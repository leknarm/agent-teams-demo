package com.formbuilder.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public record BulkDeleteRequest(
        @NotEmpty(message = "ids must not be empty")
        List<UUID> ids
) {}
