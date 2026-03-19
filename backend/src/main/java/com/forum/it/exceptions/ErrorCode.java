package com.forum.it.exceptions;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // ── Generic ───────────────────────────────────────────────────────────────
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1003, "Invalid key", HttpStatus.BAD_REQUEST),
    NOT_FOUND(1006, "Not found", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(1007, "Method not allowed", HttpStatus.METHOD_NOT_ALLOWED),

    // ── Auth ──────────────────────────────────────────────────────────────────
    UNAUTHORIZED(1004, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(1005, "Forbidden", HttpStatus.FORBIDDEN),
    TOKEN_EXPIRED(1012, "Access token has expired", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID(1013, "Access token is invalid", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_INVALID(1014, "Refresh token is invalid or expired", HttpStatus.UNAUTHORIZED),
    INVALID_PASSWORD(1011, "Invalid password", HttpStatus.UNAUTHORIZED),
    INVALID_OLD_PASSWORD(1015, "Current password is incorrect", HttpStatus.BAD_REQUEST),
    OTP_INVALID(1018, "Invalid or expired OTP", HttpStatus.BAD_REQUEST),
    OTP_REQUIRED(1019, "OTP is required for login", HttpStatus.BAD_REQUEST),

    // ── User / Account ────────────────────────────────────────────────────────
    USER_EXISTED(1001, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1002, "User not found", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS(1008, "Email already exists", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_FOUND(1010, "Email not found", HttpStatus.NOT_FOUND),
    USERNAME_ALREADY_EXISTS(1009, "Username already exists", HttpStatus.BAD_REQUEST),
    ACCOUNT_NOT_FOUND(1010, "Account not found", HttpStatus.NOT_FOUND),
    ACCOUNT_NOT_EXIST(1010, "Account does not exist", HttpStatus.NOT_FOUND),
    USER_BANNED(1016, "User is banned and cannot perform this action", HttpStatus.FORBIDDEN),
    USER_DELETED(1017, "User account has been deleted", HttpStatus.FORBIDDEN),
    USER_CREDENTIALS_INVALID(1018, "Invalid credentials", HttpStatus.UNAUTHORIZED),
    // ── Post ──────────────────────────────────────────────────────────────────
    POST_NOT_FOUND(2001, "Post not found", HttpStatus.NOT_FOUND),
    POST_DUPLICATE_TITLE(2002, "You already have a post with this title", HttpStatus.BAD_REQUEST),
    POST_NOT_PUBLISHED(2003, "Post is not published", HttpStatus.BAD_REQUEST),
    POST_REJECTED(2004, "Cannot edit a rejected post", HttpStatus.BAD_REQUEST),

    // ── Comment ───────────────────────────────────────────────────────────────
    COMMENT_NOT_FOUND(3001, "Comment not found", HttpStatus.NOT_FOUND),
    COMMENT_NESTED_REPLY(3002, "Cannot reply to a reply — only one level of nesting is allowed",
            HttpStatus.BAD_REQUEST),
    COMMENT_WRONG_POST(3003, "Parent comment does not belong to the same post", HttpStatus.BAD_REQUEST),

    // ── Reaction ──────────────────────────────────────────────────────────────
    ALREADY_REACTED(4001, "You have already reacted to this post", HttpStatus.BAD_REQUEST),
    REACTION_NOT_FOUND(4002, "Reaction not found", HttpStatus.NOT_FOUND),

    // ── Share ─────────────────────────────────────────────────────────────────
    SHARE_NOT_FOUND(5001, "Share not found", HttpStatus.NOT_FOUND),

    // ── Bookmark ──────────────────────────────────────────────────────────────
    BOOKMARK_ALREADY_EXISTS(6001, "Post is already bookmarked", HttpStatus.BAD_REQUEST),
    BOOKMARK_NOT_FOUND(6002, "Bookmark not found", HttpStatus.NOT_FOUND),

    // ── Tag ───────────────────────────────────────────────────────────────────
    TAG_NOT_FOUND(7001, "Tag not found", HttpStatus.NOT_FOUND),
    TAG_ALREADY_EXISTS(7002, "Tag already exists", HttpStatus.BAD_REQUEST),

    // ── Role ──────────────────────────────────────────────────────────────────
    ROLE_NOT_FOUND(8001, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_ALREADY_EXISTS(8002, "Role already exists", HttpStatus.BAD_REQUEST),

    // ── Notification ──────────────────────────────────────────────────────────
    NOTIFICATION_NOT_FOUND(9001, "Notification not found", HttpStatus.NOT_FOUND),

    // ── Message / Chat ────────────────────────────────────────────────────────
    MESSAGE_NOT_FOUND(10001, "Message not found", HttpStatus.NOT_FOUND),

    // ── Rate Limit ────────────────────────────────────────────────────────────
    RATE_LIMIT_EXCEEDED(429, "Too many requests — please try again later", HttpStatus.TOO_MANY_REQUESTS);

    private final int code;
    private final String message;
    private final HttpStatus statusCode;

    ErrorCode(int code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
