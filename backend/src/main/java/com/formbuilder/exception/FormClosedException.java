package com.formbuilder.exception;

import org.springframework.http.HttpStatus;

public class FormClosedException extends BusinessException {

    private final String closedMessage;

    public FormClosedException(String closedMessage) {
        super(closedMessage, HttpStatus.GONE);
        this.closedMessage = closedMessage;
    }

    public String getClosedMessage() {
        return closedMessage;
    }
}
