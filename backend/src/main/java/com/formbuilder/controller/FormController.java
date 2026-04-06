package com.formbuilder.controller;

import com.formbuilder.dto.request.CreateFormRequest;
import com.formbuilder.dto.request.UpdateFormRequest;
import com.formbuilder.dto.response.FormAnalyticsResponse;
import com.formbuilder.dto.response.FormResponse;
import com.formbuilder.dto.response.FormSummaryResponse;
import com.formbuilder.dto.response.PageResponse;
import com.formbuilder.enums.FormStatus;
import com.formbuilder.service.AnalyticsService;
import com.formbuilder.service.FormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;
    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<PageResponse<FormSummaryResponse>> listForms(
            @RequestParam(required = false) FormStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(formService.listForms(status, search, pageable));
    }

    @PostMapping
    public ResponseEntity<FormResponse> createForm(
            @Valid @RequestBody CreateFormRequest request) {
        FormResponse created = formService.createForm(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{formId}")
    public ResponseEntity<FormResponse> getForm(@PathVariable UUID formId) {
        return ResponseEntity.ok(formService.getForm(formId));
    }

    @PutMapping("/{formId}")
    public ResponseEntity<FormResponse> updateForm(
            @PathVariable UUID formId,
            @Valid @RequestBody UpdateFormRequest request) {
        return ResponseEntity.ok(formService.updateForm(formId, request));
    }

    @DeleteMapping("/{formId}")
    public ResponseEntity<Void> deleteForm(@PathVariable UUID formId) {
        formService.deleteForm(formId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{formId}/publish")
    public ResponseEntity<FormResponse> publishForm(@PathVariable UUID formId) {
        return ResponseEntity.ok(formService.publishForm(formId));
    }

    @PostMapping("/{formId}/close")
    public ResponseEntity<FormResponse> closeForm(@PathVariable UUID formId) {
        return ResponseEntity.ok(formService.closeForm(formId));
    }

    @PostMapping("/{formId}/duplicate")
    public ResponseEntity<FormResponse> duplicateForm(@PathVariable UUID formId) {
        FormResponse duplicate = formService.duplicateForm(formId);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/forms/{id}")
                .buildAndExpand(duplicate.id())
                .toUri();
        return ResponseEntity.created(location).body(duplicate);
    }

    @GetMapping("/{formId}/analytics")
    public ResponseEntity<FormAnalyticsResponse> getAnalytics(
            @PathVariable UUID formId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate effectiveFrom = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate effectiveTo = to != null ? to : LocalDate.now();
        return ResponseEntity.ok(analyticsService.getFormAnalytics(formId, effectiveFrom, effectiveTo));
    }
}
