package com.forum.it.dtos.request;

import jakarta.validation.constraints.Size;

import com.forum.it.entities.post.PostStatus;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostRequest {

    @Data
    public static class CreatePostRequest {
        @NotBlank(message = "Title cannot be empty")
        @Size(max = 255)
        String title;

        String userId;

        @NotBlank(message = "Content cannot be empty")
        String content;
        String imageURL;

    }

    @Data
    public static class UpdatePostRequest {
        String title;
        String userId;
        String content;
        String imageURL;
        PostStatus status;
    }

}
