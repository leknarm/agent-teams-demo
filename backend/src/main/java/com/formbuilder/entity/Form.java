package com.formbuilder.entity;

import com.formbuilder.enums.FormStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "forms")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "fields")
public class Form {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FormStatus status = FormStatus.DRAFT;

    @Column(nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Convert(converter = com.formbuilder.config.JsonMapConverter.class)
    @Column(name = "settings", columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> settings = new HashMap<>();

    @Convert(converter = com.formbuilder.config.JsonMapConverter.class)
    @Column(name = "theme", columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> theme = new HashMap<>();

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("page ASC, fieldOrder ASC")
    @Builder.Default
    private List<FormField> fields = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public void addField(FormField field) {
        fields.add(field);
        field.setForm(this);
    }

    public void removeField(FormField field) {
        fields.remove(field);
        field.setForm(null);
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
