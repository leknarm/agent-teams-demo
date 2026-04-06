package com.formbuilder.controller;

import com.formbuilder.config.RateLimiter;
import com.formbuilder.dto.request.SubmitFormRequest;
import com.formbuilder.dto.response.FormResponse;
import com.formbuilder.dto.response.SubmissionResponse;
import com.formbuilder.service.FormService;
import com.formbuilder.service.SubmissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/forms")
@RequiredArgsConstructor
public class PublicFormController {

    private final FormService formService;
    private final SubmissionService submissionService;
    private final RateLimiter rateLimiter;

    @GetMapping("/{formId}")
    public ResponseEntity<FormResponse> getPublicForm(@PathVariable UUID formId) {
        return ResponseEntity.ok(formService.getPublicForm(formId));
    }

    @PostMapping("/{formId}/submissions")
    public ResponseEntity<SubmissionResponse> submitForm(
            @PathVariable UUID formId,
            @Valid @RequestBody SubmitFormRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = resolveClientIp(httpRequest);
        if (!rateLimiter.tryAcquire(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }

        SubmissionResponse submission = submissionService.submitForm(formId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/submissions/{id}")
                .buildAndExpand(submission.id())
                .toUri();
        return ResponseEntity.created(location).body(submission);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // Take the first (original client) address in a proxy chain
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
