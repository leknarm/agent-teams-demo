package com.formbuilder.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        PageInfo page
) {
    public record PageInfo(
            int number,
            int size,
            long totalElements,
            int totalPages
    ) {}

    public static <T> PageResponse<T> from(Page<T> springPage) {
        return new PageResponse<>(
                springPage.getContent(),
                new PageInfo(
                        springPage.getNumber(),
                        springPage.getSize(),
                        springPage.getTotalElements(),
                        springPage.getTotalPages()
                )
        );
    }
}
