package com.formbuilder.service;

import com.formbuilder.entity.Form;
import com.formbuilder.entity.Submission;

public interface WebhookService {
    void deliverWebhook(Form form, Submission submission);
}
