package com.forum.it.dtos.response;

import java.time.LocalDate;
import java.util.UUID;

import com.forum.it.entities.post.Reaction;
import com.forum.it.entities.post.ReactionType;

import lombok.Getter;

@Getter
public class ReactionResponse {
    private final UUID reactionId;
    private final UUID userId;
    private final UUID postId;
    private final ReactionType react;
    private final LocalDate createdAt;

    public ReactionResponse(Reaction r) {
        this.reactionId = r.getReactionId();
        this.userId   = r.getUser().getUserId();
        this.postId   = r.getPost().getPostId();
        this.react    = r.getReact();
        this.createdAt = r.getCreatedAt();
    }
}
