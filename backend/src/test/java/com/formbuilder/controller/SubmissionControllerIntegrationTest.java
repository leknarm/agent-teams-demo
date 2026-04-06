package com.formbuilder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.formbuilder.dto.request.BulkDeleteRequest;
import com.formbuilder.dto.request.CreateFormRequest;
import com.formbuilder.dto.request.FormFieldRequest;
import com.formbuilder.dto.request.SubmitFormRequest;
import com.formbuilder.dto.request.UpdateFormRequest;
import com.formbuilder.enums.FieldType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class SubmissionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String publishedFormId;

    @BeforeEach
    void setUp() throws Exception {
        // Create a published form with an email field
        CreateFormRequest createReq = new CreateFormRequest("Contact Form", null);
        MvcResult createResult = mockMvc.perform(post("/api/v1/forms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andReturn();

        publishedFormId = objectMapper.readTree(
                createResult.getResponse().getContentAsString()).get("id").asText();

        FormFieldRequest fieldReq = new FormFieldRequest(
                null, FieldType.EMAIL, "email", "Email Address",
                null, null, 0, 0, true, null, null, null, null, null
        );
        UpdateFormRequest updateReq = new UpdateFormRequest(
                "Contact Form", null, null, null, List.of(fieldReq));

        mockMvc.perform(put("/api/v1/forms/" + publishedFormId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)));

        mockMvc.perform(post("/api/v1/forms/" + publishedFormId + "/publish"));
    }

    @Test
    void submitForm_shouldReturn201_onValidData() throws Exception {
        SubmitFormRequest submitReq = new SubmitFormRequest(Map.of("email", "test@example.com"));

        mockMvc.perform(post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.formId").value(publishedFormId))
                .andExpect(jsonPath("$.data.email").value("test@example.com"));
    }

    @Test
    void submitForm_shouldReturn400_whenRequiredFieldMissing() throws Exception {
        SubmitFormRequest submitReq = new SubmitFormRequest(Map.of());

        mockMvc.perform(post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details", hasSize(greaterThan(0))));
    }

    @Test
    void submitForm_shouldReturn400_whenEmailInvalid() throws Exception {
        SubmitFormRequest submitReq = new SubmitFormRequest(Map.of("email", "not-an-email"));

        mockMvc.perform(post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details[0].field").value("email"));
    }

    @Test
    void submitForm_shouldReturn404_whenFormNotPublished() throws Exception {
        SubmitFormRequest submitReq = new SubmitFormRequest(Map.of("email", "test@example.com"));

        mockMvc.perform(post("/api/v1/public/forms/" + UUID.randomUUID() + "/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitReq)))
                .andExpect(status().isNotFound());
    }

    @Test
    void submitForm_shouldReturn410_whenFormClosed() throws Exception {
        mockMvc.perform(post("/api/v1/forms/" + publishedFormId + "/close"));

        SubmitFormRequest submitReq = new SubmitFormRequest(Map.of("email", "test@example.com"));
        mockMvc.perform(post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitReq)))
                .andExpect(status().isGone());
    }

    @Test
    void listSubmissions_shouldReturnPaginatedResults() throws Exception {
        // Submit one response first
        SubmitFormRequest submitReq = new SubmitFormRequest(Map.of("email", "list@example.com"));
        mockMvc.perform(post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(submitReq)));

        mockMvc.perform(get("/api/v1/forms/" + publishedFormId + "/submissions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").exists());
    }

    @Test
    void getSubmission_shouldReturn200() throws Exception {
        SubmitFormRequest submitReq = new SubmitFormRequest(Map.of("email", "detail@example.com"));
        MvcResult submitResult = mockMvc.perform(
                        post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(submitReq)))
                .andReturn();

        String submissionId = objectMapper.readTree(
                submitResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/v1/submissions/" + submissionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(submissionId));
    }

    @Test
    void deleteSubmission_shouldReturn204() throws Exception {
        SubmitFormRequest submitReq = new SubmitFormRequest(Map.of("email", "delete@example.com"));
        MvcResult submitResult = mockMvc.perform(
                        post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(submitReq)))
                .andReturn();

        String submissionId = objectMapper.readTree(
                submitResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(delete("/api/v1/submissions/" + submissionId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/submissions/" + submissionId))
                .andExpect(status().isNotFound());
    }

    @Test
    void bulkDeleteSubmissions_shouldReturn204() throws Exception {
        SubmitFormRequest submitReq1 = new SubmitFormRequest(Map.of("email", "bulk1@example.com"));
        SubmitFormRequest submitReq2 = new SubmitFormRequest(Map.of("email", "bulk2@example.com"));

        MvcResult r1 = mockMvc.perform(post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(submitReq1))).andReturn();
        MvcResult r2 = mockMvc.perform(post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(submitReq2))).andReturn();

        UUID id1 = UUID.fromString(objectMapper.readTree(r1.getResponse().getContentAsString()).get("id").asText());
        UUID id2 = UUID.fromString(objectMapper.readTree(r2.getResponse().getContentAsString()).get("id").asText());

        BulkDeleteRequest bulkReq = new BulkDeleteRequest(List.of(id1, id2));
        mockMvc.perform(delete("/api/v1/forms/" + publishedFormId + "/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bulkReq)))
                .andExpect(status().isNoContent());
    }

    @Test
    void exportCsv_shouldReturn200_withCsvContent() throws Exception {
        SubmitFormRequest submitReq = new SubmitFormRequest(Map.of("email", "export@example.com"));
        mockMvc.perform(post("/api/v1/public/forms/" + publishedFormId + "/submissions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(submitReq)));

        mockMvc.perform(get("/api/v1/forms/" + publishedFormId + "/submissions/export"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(header().string("Content-Disposition", containsString("attachment")));
    }
}
