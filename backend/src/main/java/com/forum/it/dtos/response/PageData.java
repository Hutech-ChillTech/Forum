package com.forum.it.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageData {
    int page; // Trang hiện tại
    int size; // Số phần tử trên 1 trang
    long totalElements; // Tổng số phần tử trong DB
    int totalPages; // Tổng số trang
}