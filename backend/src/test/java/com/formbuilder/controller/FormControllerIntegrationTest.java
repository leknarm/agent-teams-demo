package com.formbuilder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.formbuilder.dto.request.CreateFormRequest;
import com.formbuilder.dto.request.FormFieldRequest;
import com.formbuilder.dto.request.UpdateFormRequest;
import com.formbuilder.enums.FieldType;
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
class FormControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createForm_shouldReturn201() throws Exception {
        CreateFormRequest request = new CreateFormRequest("My Test Form", "Test description");

        mockMvc.perform(post("/api/v1/forms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("My Test Form"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(header().exists("Location"));
    }

    @Test
    void createForm_shouldReturn400_whenNameBlank() throws Exception {
        CreateFormRequest request = new CreateFormRequest("", null);

        mockMvc.perform(post("/api/v1/forms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details").isArray());
    }

    @Test
    void getForm_shouldReturn404_whenNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/forms/" + UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    void fullFormLifecycle_createPublishClose() throws Exception {
        // 1. Create
        CreateFormRequest createReq = new CreateFormRequest("Lifecycle Form", null);
        MvcResult createResult = mockMvc.perform(post("/api/v1/forms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String formId = objectMapper.readTree(
                createResult.getResponse().getContentAsString()).get("id").asText();

        // 2. Update with fields
        FormFieldRequest fieldReq = new FormFieldRequest(
                null, FieldType.TEXT, "user_name", "Your Name",
                null, null, 0, 0, true, null, null, null, null, null
        );
        UpdateFormRequest updateReq = new UpdateFormRequest(
                "Lifecycle Form", null, null, null, List.of(fieldReq));

        mockMvc.perform(put("/api/v1/forms/" + formId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fields", hasSize(1)));

        // 3. Publish
        mockMvc.perform(post("/api/v1/forms/" + formId + "/publish"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.version").value(2));

        // 4. Cannot update published form
        mockMvc.perform(put("/api/v1/forms/" + formId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isUnprocessableEntity());

        // 5. Close
        mockMvc.perform(post("/api/v1/forms/" + formId + "/close"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    @Test
    void publishForm_shouldReturn422_whenNoFields() throws Exception {
        CreateFormRequest createReq = new CreateFormRequest("Empty Form", null);
        MvcResult createResult = mockMvc.perform(post("/api/v1/forms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String formId = objectMapper.readTree(
                createResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(post("/api/v1/forms/" + formId + "/publish"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void duplicateForm_shouldReturn201_withCopySuffix() throws Exception {
        // Create and add field
        CreateFormRequest createReq = new CreateFormRequest("Original Form", null);
        MvcResult createResult = mockMvc.perform(post("/api/v1/forms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String formId = objectMapper.readTree(
                createResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(post("/api/v1/forms/" + formId + "/duplicate"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Original Form (Copy)"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void listForms_shouldReturnPaginatedResults() throws Exception {
        // Create two forms
        mockMvc.perform(post("/api/v1/forms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateFormRequest("Form A", null))))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/v1/forms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateFormRequest("Form B", null))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/forms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page.totalElements").value(greaterThanOrEqualTo(2)));
    }

    @Test
    void deleteForm_shouldReturn204() throws Exception {
        CreateFormRequest createReq = new CreateFormRequest("To Delete", null);
        MvcResult createResult = mockMvc.perform(post("/api/v1/forms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String formId = objectMapper.readTree(
                createResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(delete("/api/v1/forms/" + formId))
                .andExpect(status().isNoContent());

        // Should be 404 after delete
        mockMvc.perform(get("/api/v1/forms/" + formId))
                .andExpect(status().isNotFound());
    }
}
