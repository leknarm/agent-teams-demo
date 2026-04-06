package com.formbuilder.exception;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        int status,
        String error,
        String message,
        List<FieldErrorDetail> details,
        Instant timestamp,
        String path
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(status, error, message, List.of(), Instant.now(), path);
    }

    public static ErrorResponse of(int status, String error, String message,
                                   List<FieldErrorDetail> details, String path) {
        return new ErrorResponse(status, error, message, details, Instant.now(), path);
    }
}
