package com.forum.it.dtos.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCommentRequest {

    @NotNull(message = "Post ID is required")
    private UUID postId;

    // userId is intentionally NOT accepted from the client — it is resolved
    // from the JWT token in the service layer to prevent userId spoofing.

    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 5000, message = "Content must be between 1 and 5000 characters")
    private String content;

    private UUID parentId;
}
