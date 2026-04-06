package com.formbuilder.service;

import com.formbuilder.dto.request.SubmitFormRequest;
import com.formbuilder.dto.response.PageResponse;
import com.formbuilder.dto.response.SubmissionResponse;
import com.formbuilder.dto.response.SubmissionSummaryResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface SubmissionService {

    SubmissionResponse submitForm(UUID formId, SubmitFormRequest request);

    PageResponse<SubmissionSummaryResponse> listSubmissions(UUID formId, Pageable pageable);

    SubmissionResponse getSubmission(UUID submissionId);

    void deleteSubmission(UUID submissionId);

    void bulkDeleteSubmissions(UUID formId, List<UUID> ids);

    void exportCsv(UUID formId, HttpServletResponse response) throws IOException;
}
