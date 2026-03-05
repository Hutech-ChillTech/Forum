package com.forum.it.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.dtos.response.PageData;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiResponses<T> {
    @Builder.Default
    private int code = 1000;
    String message;
    T result;
    @Builder.Default
    long timstamp = System.currentTimeMillis();
    PageData metadata;

    public static <T> ApiResponses<T> success(T result, PageData metadata) {
        return ApiResponses.<T>builder().result(result).metadata(metadata).build();
    }

    public static <T> ApiResponses<T> error(ErrorCode errorCode) {
        return ApiResponses.<T>builder().code(errorCode.getCode()).message(errorCode.getMessage()).build();
    }
}
