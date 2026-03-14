package com.forum.it.dtos.request;

import com.forum.it.entities.post.SharePlatform;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShareRequest {

    @NotNull(message = "Platform is required")
    private SharePlatform platform;
}
