package com.forum.it.dtos.response;

import java.time.LocalDate;
import java.util.UUID;

import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.PostStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class PostResponse {

    UUID postId;
    UUID userId;
    String title;
    String content;
    String imageURL;
    PostStatus status;
    LocalDate createdAt;
    LocalDate updatedAt;
    UserResponse user;
    int commentCount;

    public PostResponse(Post post) {
        this.postId = post.getPostId();
        this.userId = post.getUser().getUserId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.imageURL = post.getImageURL();
        this.status = post.getStatus();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();

        if (post.getUser() != null) {
            this.user = new UserResponse(post.getUser());
        }

        if (post.getComments() != null) {
            this.commentCount = post.getComments().size();
        } else {
            this.commentCount = 0;
        }
    }
}
