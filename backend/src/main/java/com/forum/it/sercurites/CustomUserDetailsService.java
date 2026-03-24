package com.forum.it.sercurites;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.entities.user.Account;
import com.forum.it.entities.user.AccountRole;
import com.forum.it.entities.user.Role;
import com.forum.it.entities.user.RolePermission;
import com.forum.it.repositories.AccountRepository;
import com.forum.it.repositories.AccountRoleRepository;
import com.forum.it.repositories.RolePermissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;
    private final AccountRoleRepository accountRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // 1. Get Roles for Account
        List<AccountRole> accountRoles = accountRoleRepository.findByAccount_AccountId(account.getAccountId());

        Set<UUID> roleIds = new HashSet<>();
        for (AccountRole ar : accountRoles) {
            Role role = ar.getRole();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            roleIds.add(role.getRoleId());
        }
        if (!roleIds.isEmpty()) {
            List<RolePermission> rolePermissions = rolePermissionRepository.findByRole_RoleIdIn(roleIds);
            for (RolePermission rp : rolePermissions) {
                authorities.add(new SimpleGrantedAuthority(rp.getPermission().getName()));
            }
        }

        return new org.springframework.security.core.userdetails.User(
                account.getEmail(),
                account.getPassword(),
                authorities);
    }
}
