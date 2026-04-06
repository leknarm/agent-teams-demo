package com.formbuilder.entity;

import com.formbuilder.config.JsonListConverter;
import com.formbuilder.config.JsonMapConverter;
import com.formbuilder.enums.FieldType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "form_fields",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_form_fields_form_name",
                columnNames = {"form_id", "name"}
        ))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "form")
public class FormField {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FieldType type;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 500)
    private String label;

    @Column(length = 500)
    private String placeholder;

    @Column(name = "help_text", length = 1000)
    private String helpText;

    @Column(name = "field_order", nullable = false)
    private Integer fieldOrder;

    @Column(nullable = false)
    @Builder.Default
    private Integer page = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean required = false;

    @Column(name = "default_value")
    private String defaultValue;

    @Convert(converter = JsonListConverter.class)
    @Column(name = "validation_rules", columnDefinition = "TEXT")
    @Builder.Default
    private List<Map<String, Object>> validationRules = new ArrayList<>();

    @Convert(converter = JsonListConverter.class)
    @Column(name = "options", columnDefinition = "TEXT")
    private List<Map<String, Object>> options;

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "config", columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> config = new HashMap<>();

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "visibility_rules", columnDefinition = "TEXT")
    private Map<String, Object> visibilityRules;
}
