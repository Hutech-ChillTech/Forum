package com.forum.it.dtos.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModerationActionRequest {

    @NotNull(message = "Target user ID is required")
    private UUID targetUserId;

    @NotBlank(message = "Action is required")
    @Size(max = 255)
    private String action;

    @Size(max = 2000, message = "Reason must not exceed 2000 characters")
    private String reason;
}
