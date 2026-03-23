package com.forum.it.configs;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.entities.user.Permission;
import com.forum.it.entities.user.Role;
import com.forum.it.entities.user.RolePermission;
import com.forum.it.repositories.PermissionRepository;
import com.forum.it.repositories.RolePermissionRepository;
import com.forum.it.repositories.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedPermissions();
        seedRoles();
        assignPermissionsToRoles();
    }

    private void seedPermissions() {
        List<String> allPermissions = List.of(
                "user:read", "user:write", "user:delete",
                "post:read", "post:write", "post:delete");

        allPermissions.forEach(name -> {
            if (permissionRepository.findByName(name).isEmpty()) {
                Permission p = new Permission();
                p.setName(name);
                permissionRepository.save(p);
            }
        });
    }

    private void seedRoles() {
        List<String> roles = List.of("ADMIN", "MODERATOR", "USER");
        roles.forEach(roleName -> {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
        });
    }

    private void assignPermissionsToRoles() {
        Map<String, List<String>> roleMapping = Map.of(
                "ADMIN", List.of("user:read", "user:write", "user:delete", "post:read", "post:write", "post:delete"),
                "MODERATOR", List.of("user:read", "post:read", "post:write", "post:delete"),
                "USER", List.of("user:read", "post:read", "post:write"));

        roleMapping.forEach((roleName, permissionNames) -> {
            Role role = roleRepository.findByName(roleName).orElse(null);
            if (role != null) {
                Set<String> currentPermissionNames = rolePermissionRepository.findByRole(role)
                        .stream()
                        .map(rp -> rp.getPermission().getName())
                        .collect(Collectors.toSet());

                for (String pName : permissionNames) {
                    if (!currentPermissionNames.contains(pName)) {
                        Permission p = permissionRepository.findByName(pName).orElse(null);
                        if (p != null) {
                            RolePermission rp = new RolePermission();
                            rp.setRole(role);
                            rp.setPermission(p);
                            rolePermissionRepository.save(rp);
                        }
                    }
                }
            }
        });
    }
}
