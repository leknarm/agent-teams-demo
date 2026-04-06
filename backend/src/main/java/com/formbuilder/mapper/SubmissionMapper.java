package com.formbuilder.mapper;

import com.formbuilder.dto.response.SubmissionResponse;
import com.formbuilder.dto.response.SubmissionSummaryResponse;
import com.formbuilder.entity.Submission;
import org.springframework.stereotype.Component;

@Component
public class SubmissionMapper {

    public SubmissionResponse toResponse(Submission submission) {
        return new SubmissionResponse(
                submission.getId(),
                submission.getForm().getId(),
                submission.getFormVersion(),
                submission.getData(),
                submission.getSubmittedAt(),
                submission.getCreatedAt()
        );
    }

    public SubmissionSummaryResponse toSummaryResponse(Submission submission) {
        return new SubmissionSummaryResponse(
                submission.getId(),
                submission.getData(),
                submission.getSubmittedAt()
        );
    }
}
