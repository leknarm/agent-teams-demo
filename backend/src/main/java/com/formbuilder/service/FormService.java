package com.formbuilder.service;

import com.formbuilder.dto.request.CreateFormRequest;
import com.formbuilder.dto.request.UpdateFormRequest;
import com.formbuilder.dto.response.FormResponse;
import com.formbuilder.dto.response.FormSummaryResponse;
import com.formbuilder.dto.response.PageResponse;
import com.formbuilder.enums.FormStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface FormService {

    PageResponse<FormSummaryResponse> listForms(FormStatus status, String search, Pageable pageable);

    FormResponse getForm(UUID id);

    FormResponse getPublicForm(UUID id);

    FormResponse createForm(CreateFormRequest request);

    FormResponse updateForm(UUID id, UpdateFormRequest request);

    void deleteForm(UUID id);

    FormResponse publishForm(UUID id);

    FormResponse closeForm(UUID id);

    FormResponse duplicateForm(UUID id);
}
