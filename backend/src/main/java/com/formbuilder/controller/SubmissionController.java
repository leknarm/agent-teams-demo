package com.formbuilder.controller;

import com.formbuilder.dto.request.BulkDeleteRequest;
import com.formbuilder.dto.response.PageResponse;
import com.formbuilder.dto.response.SubmissionResponse;
import com.formbuilder.dto.response.SubmissionSummaryResponse;
import com.formbuilder.service.SubmissionService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/api/v1/forms/{formId}/submissions")
    public ResponseEntity<PageResponse<SubmissionSummaryResponse>> listSubmissions(
            @PathVariable UUID formId,
            @PageableDefault(size = 20, sort = "submittedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(submissionService.listSubmissions(formId, pageable));
    }

    @GetMapping("/api/v1/submissions/{submissionId}")
    public ResponseEntity<SubmissionResponse> getSubmission(@PathVariable UUID submissionId) {
        return ResponseEntity.ok(submissionService.getSubmission(submissionId));
    }

    @DeleteMapping("/api/v1/submissions/{submissionId}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable UUID submissionId) {
        submissionService.deleteSubmission(submissionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/v1/forms/{formId}/submissions")
    public ResponseEntity<Void> bulkDeleteSubmissions(
            @PathVariable UUID formId,
            @Valid @RequestBody BulkDeleteRequest request) {
        submissionService.bulkDeleteSubmissions(formId, request.ids());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/forms/{formId}/submissions/export")
    public void exportCsv(
            @PathVariable UUID formId,
            HttpServletResponse response) throws IOException {
        submissionService.exportCsv(formId, response);
    }
}
