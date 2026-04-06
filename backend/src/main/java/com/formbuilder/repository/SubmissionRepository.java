package com.formbuilder.repository;

import com.formbuilder.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

    Page<Submission> findByFormId(UUID formId, Pageable pageable);

    long countByFormId(UUID formId);

    List<Submission> findByFormIdOrderBySubmittedAtDesc(UUID formId);

    @Modifying
    @Query("DELETE FROM Submission s WHERE s.id IN :ids AND s.form.id = :formId")
    void deleteByIdInAndFormId(@Param("ids") List<UUID> ids, @Param("formId") UUID formId);

    @Query(value = "SELECT CAST(s.submitted_at AS DATE) as date, COUNT(s.id) as count " +
                   "FROM submissions s WHERE s.form_id = :formId " +
                   "AND s.submitted_at >= :from AND s.submitted_at <= :to " +
                   "GROUP BY CAST(s.submitted_at AS DATE) " +
                   "ORDER BY CAST(s.submitted_at AS DATE)",
           nativeQuery = true)
    List<Object[]> countByDay(@Param("formId") UUID formId,
                              @Param("from") Instant from,
                              @Param("to") Instant to);
}
