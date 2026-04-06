package com.formbuilder.repository;

import com.formbuilder.entity.Form;
import com.formbuilder.enums.FormStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface FormRepository extends JpaRepository<Form, UUID> {

    // All queries explicitly filter deleted_at IS NULL to guard against Hibernate versions
    // where @SQLRestriction may not be applied consistently to all query types (BUG-001).

    @Query("SELECT f FROM Form f WHERE f.deletedAt IS NULL ORDER BY f.createdAt DESC")
    Page<Form> findAllActive(Pageable pageable);

    @Query("SELECT f FROM Form f WHERE f.status = :status AND f.deletedAt IS NULL")
    Page<Form> findByStatus(@Param("status") FormStatus status, Pageable pageable);

    @Query("SELECT f FROM Form f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) AND f.deletedAt IS NULL")
    Page<Form> findByNameContainingIgnoreCase(@Param("search") String search, Pageable pageable);

    @Query("SELECT f FROM Form f WHERE f.status = :status AND LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) AND f.deletedAt IS NULL")
    Page<Form> findByStatusAndNameContainingIgnoreCase(@Param("status") FormStatus status, @Param("search") String search, Pageable pageable);

    @Query("SELECT f FROM Form f WHERE f.id = :id AND f.deletedAt IS NULL")
    Optional<Form> findByIdAndDeletedAtIsNull(@Param("id") UUID id);

    // Bypasses soft-delete filter — use only when intentionally accessing deleted records
    @Query("SELECT f FROM Form f WHERE f.id = :id")
    Optional<Form> findByIdIncludingDeleted(@Param("id") UUID id);
}
