// File: src/main/java/com/forum/it/exceptions/GlobalExceptinHandler.java

package com.forum.it.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.forum.it.dtos.response.ApiResponses;

@RestControllerAdvice
public class GlobalExceptinHandler {

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponses<Object>> handlingRuntimeException(Exception exception) {
        // In toàn bộ stack trace của lỗi ra Terminal để debug
        exception.printStackTrace();

        ApiResponses<Object> apiResponses = new ApiResponses<>();
        apiResponses.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        // Lấy chính xác thông điệp lỗi gốc đẩy ra Postman thay vì gộp lại thành
        // Uncategorized
        apiResponses.setMessage(exception.getMessage());

        return ResponseEntity.badRequest().body(apiResponses);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponses<Object>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponses<Object> apiResponses = new ApiResponses<>();
        apiResponses.setCode(errorCode.getCode());
        apiResponses.setMessage(errorCode.getMessage());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponses);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponses<Object>> handlingValidation(MethodArgumentNotValidException exception) {
        String enumKey = exception.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        try {
            errorCode = ErrorCode.valueOf(enumKey);
        } catch (IllegalArgumentException e) {
            // Use generic message if not an ErrorCode enum value
            ApiResponses<Object> apiResponse = new ApiResponses<>();
            apiResponse.setCode(400);
            apiResponse.setMessage(enumKey);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        }
        ApiResponses<Object> apiResponse = new ApiResponses<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = ResourceNotFoundException.class)
    ResponseEntity<ApiResponses<Object>> handlingResourceNotFound(ResourceNotFoundException exception) {
        ApiResponses<Object> apiResponses = new ApiResponses<>();
        apiResponses.setCode(404);
        apiResponses.setMessage(exception.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiResponses);
    }

    @ExceptionHandler(value = BadRequestException.class)
    ResponseEntity<ApiResponses<Object>> handlingBadRequest(BadRequestException exception) {
        ApiResponses<Object> apiResponses = new ApiResponses<>();
        apiResponses.setCode(400);
        apiResponses.setMessage(exception.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponses);
    }

    @ExceptionHandler(value = ForbiddenException.class)
    ResponseEntity<ApiResponses<Object>> handlingForbidden(ForbiddenException exception) {
        ApiResponses<Object> apiResponses = new ApiResponses<>();
        apiResponses.setCode(403);
        apiResponses.setMessage(exception.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(apiResponses);
    }
}
