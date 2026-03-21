package com.forum.it.utils;

import java.util.HashMap;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.forum.it.dtos.response.PageData;

/**
 * Shared pagination and sort utilities — eliminates duplicated buildPageable /
 * buildPageResponse blocks across controllers.
 */
public final class PageUtil {

    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Builds a Pageable from query params.
     *
     * @param page  0-based page index
     * @param size  items per page (capped at MAX_PAGE_SIZE)
     * @param sort  "field,direction" — e.g. "createdAt,desc"
     */
    public static Pageable buildPageable(int page, int size, String sort) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int safePage = Math.max(page, 0);

        if (sort == null || sort.isBlank()) {
            return PageRequest.of(safePage, safeSize);
        }

        String[] parts = sort.split(",");
        String field = sanitizeSortField(parts[0].trim());
        Sort.Direction direction = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(safePage, safeSize, Sort.by(direction, field));
    }

    /**
     * Builds a standardised paginated response map.
     *
     * @param pageData content page returned by the repository
     * @param dataKey  JSON key used for the content list — e.g. "posts"
     */
    public static Map<String, Object> buildPageResponse(Page<?> pageData, String dataKey) {
        Map<String, Object> response = new HashMap<>();
        response.put(dataKey, pageData.getContent());
        response.put("currentPage", pageData.getNumber());
        response.put("totalItems", pageData.getTotalElements());
        response.put("totalPages", pageData.getTotalPages());
        response.put("pageSize", pageData.getSize());
        return response;
    }

    /**
     * Creates a {@link PageData} metadata object from a {@link Page}.
     */
    public static PageData toPageData(Page<?> page) {
        return PageData.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    /**
     * Allowlist-based field name sanitisation: only word characters are accepted.
     * Prevents injection through the sort parameter.
     */
    private static String sanitizeSortField(String field) {
        if (field == null || !field.matches("[a-zA-Z][a-zA-Z0-9]*")) {
            return "createdAt";  // safe default
        }
        return field;
    }

    private PageUtil() {}
}
