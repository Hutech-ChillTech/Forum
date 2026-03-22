package com.forum.it.dtos.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequest {
    private UUID accountId;
    @NotBlank(message = "Role name is required")
    private String roleName;
}
