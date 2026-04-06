package com.formbuilder.repository;

import com.formbuilder.entity.SubmissionValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SubmissionValueRepository extends JpaRepository<SubmissionValue, UUID> {

    @Query("SELECT sv.fieldName, sv.value, COUNT(sv) FROM SubmissionValue sv " +
           "WHERE sv.submission.form.id = :formId " +
           "GROUP BY sv.fieldName, sv.value")
    List<Object[]> countValuesByField(@Param("formId") UUID formId);
}
