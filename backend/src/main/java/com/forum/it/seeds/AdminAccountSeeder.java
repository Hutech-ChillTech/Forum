package com.forum.it.seeds;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.forum.it.entities.user.Account;
import com.forum.it.entities.user.AccountRole;
import com.forum.it.entities.user.AccountVerifyCheck;
import com.forum.it.entities.user.Role;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.repositories.AccountRepository;
import com.forum.it.repositories.AccountRoleRepository;
import com.forum.it.repositories.RoleRepository;
import com.forum.it.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2) // Run after DataSeeder (which seeds roles)
public class AdminAccountSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AccountRoleRepository accountRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        String adminEmail = "admin@forum.com";
        String adminPassword = "admin"; // You should change this later

        // 1. Check if admin already exists
        if (accountRepository.existsByEmail(adminEmail)) {
            return;
        }

        // 2. Get ADMIN role
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName("ADMIN");
            return roleRepository.save(newRole);
        });

        // 3. Create User
        User adminUser = new User();
        adminUser.setUserName("admin");
        adminUser.setFullName("System Administrator");
        adminUser.setEmail(adminEmail);
        adminUser.setPassword(passwordEncoder.encode(adminPassword));
        adminUser.setVerifyStatus(UserStatus.ACTIVE);
        adminUser = userRepository.save(adminUser);

        // 4. Create Account
        Account adminAccount = new Account();
        adminAccount.setEmail(adminEmail);
        adminAccount.setPassword(passwordEncoder.encode(adminPassword));
        adminAccount.setProvider("LOCAL");
        adminAccount.setIsVerify(AccountVerifyCheck.VERIFY);
        adminAccount.setUser(adminUser);
        adminAccount = accountRepository.save(adminAccount);

        // 5. Assign Role
        AccountRole accountRole = new AccountRole();
        accountRole.setAccount(adminAccount);
        accountRole.setRole(adminRole);
        accountRoleRepository.save(accountRole);
    }
}
