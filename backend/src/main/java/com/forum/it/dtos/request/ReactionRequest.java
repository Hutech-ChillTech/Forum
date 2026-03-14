package com.forum.it.dtos.request;

import com.forum.it.entities.post.ReactionType;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReactionRequest {

    @NotNull(message = "Reaction type is required")
    private ReactionType react;
}
