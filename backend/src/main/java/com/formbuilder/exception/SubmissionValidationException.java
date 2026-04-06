package com.formbuilder.exception;

import java.util.List;

public class SubmissionValidationException extends RuntimeException {

    private final List<FieldErrorDetail> errors;

    public SubmissionValidationException(List<FieldErrorDetail> errors) {
        super("Submission validation failed");
        this.errors = errors;
    }

    public List<FieldErrorDetail> getErrors() {
        return errors;
    }
}
