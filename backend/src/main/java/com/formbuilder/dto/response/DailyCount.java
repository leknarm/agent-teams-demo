package com.formbuilder.dto.response;

import java.time.LocalDate;

public record DailyCount(
        LocalDate date,
        Long count
) {}
