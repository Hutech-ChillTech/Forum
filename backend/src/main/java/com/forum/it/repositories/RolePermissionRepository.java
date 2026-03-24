package com.forum.it.repositories;

import com.forum.it.entities.user.Role;
import com.forum.it.entities.user.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, UUID> {
    List<RolePermission> findByRole(Role role);

    List<RolePermission> findByRole_RoleIdIn(Set<UUID> roleIds);
}
