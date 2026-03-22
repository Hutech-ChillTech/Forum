package com.forum.it.dtos.response;

import java.time.LocalDate;
import java.util.UUID;

import com.forum.it.entities.post.Like;

import lombok.Getter;

@Getter
public class LikeResponse {
    private final UUID likeId;
    private final UUID userId;
    private final UUID postId;
    private final LocalDate createdAt;
    private final boolean isLiked;

    public LikeResponse(Like l) {
        this.likeId = l.getLikeId();
        this.userId = l.getUser().getUserId();
        this.postId = l.getPost().getPostId();
        this.createdAt = l.getCreatedAt();
        this.isLiked = true;
    }

    public LikeResponse(UUID postId, UUID userId, boolean isLiked) {
        this.likeId = null;
        this.userId = userId;
        this.postId = postId;
        this.createdAt = LocalDate.now();
        this.isLiked = isLiked;
    }
}
