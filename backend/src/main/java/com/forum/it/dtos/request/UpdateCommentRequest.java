package com.forum.it.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateCommentRequest {

    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 5000, message = "Content must be between 1 and 5000 characters")
    private String content;

    public UpdateCommentRequest() {}

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
