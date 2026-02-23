package com.forum.it.dtos.response;

import java.util.UUID;

import com.forum.it.entities.user.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {
    private UUID roleId;
    private String name;

    public RoleResponse(Role role) {
        this.roleId = role.getRoleId();
        this.name = role.getName();
    }
}
