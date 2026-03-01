package com.forum.it.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.forum.it.dtos.request.CreateUserRequest;
import com.forum.it.dtos.request.LoginRequest;
import com.forum.it.dtos.request.RefreshTokenRequest;
import com.forum.it.dtos.response.AuthResponse;
import com.forum.it.entities.user.Account;
import com.forum.it.entities.user.AccountStatus;
import com.forum.it.entities.user.AccountVerifyCheck;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.repositories.AccountRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.sercurites.JwtTokenProvider;

import com.forum.it.entities.user.AccountRole;
import com.forum.it.entities.user.Role;
import com.forum.it.repositories.AccountRoleRepository;
import com.forum.it.repositories.RoleRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountService {

    AccountRepository accountRepository;
    UserRepository userRepository;
    AccountRoleRepository accountRoleRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    JwtTokenProvider jwtTokenProvider;
    AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(CreateUserRequest request) {
        try {
            // 1. Validate constraints
            if (accountRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            if (userRepository.existsByUserName(request.getUserName())) {
                throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
            }

            // 2. Create User Entity
            User user = new User();
            user.setUserName(request.getUserName());
            user.setEmail(request.getEmail());
            user.setFullName(request.getFullName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setGender(request.getGender());
            user.setPhone(request.getPhone());
            user.setDateOfBirth(request.getDateOfBirth());
            user.setVerifyStatus(UserStatus.ACTIVE);
            user.setStatus(AccountStatus.OFFLINE);

            User savedUser = userRepository.save(user);

            // 3. Create Account Entity linked to User
            Account account = new Account();
            account.setEmail(request.getEmail());
            account.setPassword(savedUser.getPassword());
            account.setProvider("LOCAL");
            account.setIsVerify(AccountVerifyCheck.UNVERIFY);
            account.setUser(savedUser);

            Account savedAccount = accountRepository.save(account);

            // Assign default role USER
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
            AccountRole accountRole = new AccountRole();
            accountRole.setAccount(savedAccount);
            accountRole.setRole(userRole);
            accountRoleRepository.save(accountRole);

            // 4. Generate Token (Optional: Auto login after register)
            String token = jwtTokenProvider.generateToken(account, userRole.getName());

            return AuthResponse.builder()
                    .accessToken(token)
                    .authenticated(true)
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            Account account = accountRepository.findByEmail(request.getEmail());
            if (account == null) {
                throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
            }

            String roleName = accountRoleRepository.findByAccount_AccountId(account.getAccountId())
                    .stream().findFirst()
                    .map(accountRole -> accountRole.getRole().getName())
                    .orElse("USER");

            String accessToken = jwtTokenProvider.generateToken(account, roleName);
            String refreshToken = jwtTokenProvider.generateRefreshToken(account);

            account.setRefreshToken(refreshToken);
            accountRepository.save(account);

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .authenticated(true)
                    .build();

        } catch (Exception e) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Transactional
    public void logout() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                String email = ((UserDetails) principal).getUsername();
                Account account = accountRepository.findByEmail(email);

                if (account != null) {
                    account.setRefreshToken(null);
                    accountRepository.save(account);
                }
            } else {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        try {
            String token = request.getRefreshToken();
            String userEmail = jwtTokenProvider.extractUsername(token);
            Account account = accountRepository.findByEmail(userEmail);

            if (account == null || account.getRefreshToken() == null || !account.getRefreshToken().equals(token)
                    || !jwtTokenProvider.isTokenValid(token, userEmail))
                throw new AppException(ErrorCode.UNAUTHORIZED);

            String roleName = accountRoleRepository.findByAccount_AccountId(account.getAccountId()).stream().findFirst()
                    .map(accountRole -> accountRole.getRole().getName()).orElse("USER");

            String newAccessToken = jwtTokenProvider.generateToken(account, roleName);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(account);

            account.setRefreshToken(newRefreshToken);
            accountRepository.save(account);

            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .authenticated(true)
                    .build();

        } catch (Exception e) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}
