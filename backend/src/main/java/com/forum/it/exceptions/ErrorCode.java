package com.forum.it.exceptions;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized Error", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_EXISTED(1001, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1002, "User not found", HttpStatus.NOT_FOUND),
    INVALID_KEY(1003, "Invalid key", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1004, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(1005, "Forbidden", HttpStatus.FORBIDDEN),
    NOT_FOUND(1006, "Not found", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(1007, "Method not allowed", HttpStatus.METHOD_NOT_ALLOWED),
    EMAIL_ALREADY_EXISTS(1008, "Email already exists", HttpStatus.BAD_REQUEST),
    USERNAME_ALREADY_EXISTS(1009, "Username already exists", HttpStatus.BAD_REQUEST),
    ACCOUNT_NOT_FOUND(1010, "Account not found", HttpStatus.NOT_FOUND),
    INVALID_PASSWORD(1011, "Invalid password", HttpStatus.UNAUTHORIZED);

    private final int code;
    private final String message;
    private final HttpStatus statusCode;

    ErrorCode(int code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
