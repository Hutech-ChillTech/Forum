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

        // 1. Get or Create ADMIN role first
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName("ADMIN");
            return roleRepository.save(newRole);
        });

        // 2. Check if admin account exists
        Account existingAccount = accountRepository.findByEmail(adminEmail);
        if (existingAccount != null) {
            // Check if already has ADMIN role
            boolean hasAdminRole = accountRoleRepository.findByAccount_AccountId(existingAccount.getAccountId())
                    .stream().anyMatch(ar -> ar.getRole().getName().equals("ADMIN"));

            if (!hasAdminRole) {
                log.info("Admin account exists but lacks ADMIN role. Assigning now...");
                AccountRole accountRole = new AccountRole();
                accountRole.setAccount(existingAccount);
                accountRole.setRole(adminRole);
                accountRoleRepository.save(accountRole);
            }
            return;
        }

        // 3. Create User if not exists (in case user doesn't exist but account check
        // failed - though unlikely)
        User adminUser = userRepository.findByEmail(adminEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setUserName("admin");
            newUser.setFullName("System Administrator");
            newUser.setEmail(adminEmail);
            newUser.setPassword(passwordEncoder.encode(adminPassword));
            newUser.setVerifyStatus(UserStatus.ACTIVE);
            return userRepository.save(newUser);
        });

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
        log.info("Successfully created and assigned ADMIN role to: {}", adminEmail);
    }
}
