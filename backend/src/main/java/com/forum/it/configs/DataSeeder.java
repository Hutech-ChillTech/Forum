package com.forum.it.configs;

import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.forum.it.entities.user.Role;
import com.forum.it.entities.user.RoleClaim;
import com.forum.it.repositories.RoleClaimRepository;
import com.forum.it.repositories.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final RoleClaimRepository roleClaimRepository;

    @Override

    public void run(String... args) throws Exception {
        seedRolesAndClaims();
    }

    private void seedRolesAndClaims() {
        // Define Roles and their specific permissions
        Map<String, List<String>> rolePermissions = Map.of(
                "ADMIN", List.of("user:read", "user:write", "user:delete", "post:read", "post:write", "post:delete"),
                "MODERATOR", List.of("user:read", "post:read", "post:write", "post:delete"),
                "USER", List.of("user:read", "post:read", "post:write"));

        rolePermissions.forEach((roleName, claims) -> {
            // Check if role exists
            Role role;
            try {
                role = roleRepository.findByName(roleName).orElseGet(() -> {
                    try {
                        Role newRole = new Role();
                        newRole.setName(roleName);
                        return roleRepository.save(newRole);
                    } catch (Exception e) {
                        e.printStackTrace();
                        return roleRepository.findByName(roleName).orElse(null);
                    }
                });
            } catch (Exception e) {
                e.printStackTrace();
                return;
            }

            if (role == null)
                return;

            // Check and add claims
            List<RoleClaim> existingClaims = roleClaimRepository.findByRole_RoleId(role.getRoleId());

            for (String claim : claims) {
                boolean claimExists = existingClaims.stream().anyMatch(c -> c.getClaim().equals(claim));
                if (!claimExists) {
                    try {
                        RoleClaim newClaim = new RoleClaim();
                        newClaim.setRole(role);
                        newClaim.setClaim(claim);
                        roleClaimRepository.save(newClaim);
                    } catch (Exception e) {
                        e.printStackTrace();
                        // Ignore duplicate entry error
                    }
                }
            }
        });
    }
}
