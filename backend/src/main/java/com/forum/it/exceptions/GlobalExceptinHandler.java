package com.forum.it.exceptions;

import com.forum.it.dtos.response.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptinHandler {
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponses<Object>> handlingRuntimeException(RuntimeException exception) {
        ApiResponses<Object> apiResponses = new ApiResponses<>();
        apiResponses.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponses.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
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
            // TODO: handle exception
        }
        ApiResponses<Object> apiResponse = new ApiResponses<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }
}
