package com.forum.it.dtos.response;

import java.time.LocalDate;
import java.util.UUID;

import com.forum.it.entities.post.Share;
import com.forum.it.entities.post.SharePlatform;

import lombok.Getter;

@Getter
public class ShareResponse {
    private final UUID shareId;
    private final UUID userId;
    private final UUID postId;
    private final SharePlatform platform;
    private final LocalDate createdAt;

    public ShareResponse(Share s) {
        this.shareId   = s.getShareId();
        this.userId    = s.getUser().getUserId();
        this.postId    = s.getPost().getPostId();
        this.platform  = s.getPlatform();
        this.createdAt = s.getCreatedAt();
    }
}
