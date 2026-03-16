package com.forum.it.services;

import java.util.concurrent.TimeUnit;
import java.lang.Integer;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import com.forum.it.dtos.request.ChangePasswordRequest;
import com.forum.it.dtos.request.CreateUserRequest;
import com.forum.it.dtos.request.LoginRequest;
import com.forum.it.dtos.request.RefreshTokenRequest;
import com.forum.it.dtos.response.AuthResponse;
import com.forum.it.entities.user.Account;
import com.forum.it.entities.user.AccountRole;
import com.forum.it.entities.user.AccountStatus;
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
import com.forum.it.sercurites.JwtTokenProvider;
import com.forum.it.sercurites.UserPrincipal;
import com.forum.it.utils.SecurityContextHelper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

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
    RedisService redisService;
    SecurityContextHelper securityContextHelper;

    @Value("${JWT_REFRESH_TOKEN_EXPIRATION}")
    @NonFinal
    Integer REFRESH_TOKEN_TTL;

    @Transactional
    public AuthResponse register(CreateUserRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByUserName(request.getUserName())) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

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

        Account account = new Account();
        account.setEmail(request.getEmail());
        account.setPassword(savedUser.getPassword());
        account.setProvider("LOCAL");
        account.setIsVerify(AccountVerifyCheck.UNVERIFY);
        account.setUser(savedUser);

        Account savedAccount = accountRepository.save(account);

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        AccountRole accountRole = new AccountRole();
        accountRole.setAccount(savedAccount);
        accountRole.setRole(userRole);
        accountRoleRepository.save(accountRole);

        String token = jwtTokenProvider.generateToken(account, userRole.getName());

        return AuthResponse.builder()
                .accessToken(token)
                .authenticated(true)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        Account account = accountRepository.findByEmail(request.getEmail());
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        String roleName = resolveRole(account);
        String accessToken = jwtTokenProvider.generateToken(account, roleName);
        String refreshToken = jwtTokenProvider.generateRefreshToken(account);

        redisService.setValueWithTTL("RT:" + account.getEmail(), refreshToken, REFRESH_TOKEN_TTL,
                TimeUnit.MILLISECONDS);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .authenticated(true)
                .build();
    }

    /**
     * Blacklists the raw JWT string. Call this from the controller where the
     * raw Authorization header value is available.
     */
    public void blacklistToken(String rawJwt) {
        long remaining = jwtTokenProvider.getExpirationMillis(rawJwt);
        if (remaining > 0) {
            redisService.setValueWithTTL("blacklist:" + rawJwt, "1", remaining, TimeUnit.MILLISECONDS);
        }
    }

    /**
     * Blacklists the current access token in Redis (TTL = remaining token lifetime)
     * and clears the refresh token stored on the account.
     */
    @Transactional
    public void logout(String rawJwt) {
        UserPrincipal principal = securityContextHelper.getCurrentUser();
        String email = principal.getEmail();

        redisService.deleteValue("RT:" + email);
        blacklistToken(rawJwt);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        String userEmail = jwtTokenProvider.extractUsername(token);

        String storedToken = redisService.getValue("RT: " + userEmail);
        if (storedToken == null || !storedToken.equals(token) || !jwtTokenProvider.isTokenValid(token, userEmail)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        Account account = accountRepository.findByEmail(userEmail);
        if (account == null
                || account.getRefreshToken() == null
                || !account.getRefreshToken().equals(token)
                || !jwtTokenProvider.isTokenValid(token, userEmail)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        String roleName = resolveRole(account);
        String newAccessToken = jwtTokenProvider.generateToken(account, roleName);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(account);

        // Rotate: invalidate old refresh token immediately
        redisService.setValueWithTTL("RT:" + userEmail, newRefreshToken, REFRESH_TOKEN_TTL, TimeUnit.MILLISECONDS);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .authenticated(true)
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserPrincipal principal = securityContextHelper.getCurrentUser();
        Account account = accountRepository.findByEmail(principal.getEmail());
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        String newHash = passwordEncoder.encode(request.getNewPassword());
        account.setPassword(newHash);

        // Keep user password in sync
        if (account.getUser() != null) {
            account.getUser().setPassword(newHash);
            userRepository.save(account.getUser());
        }

        accountRepository.save(account);
    }

    // ── private ───────────────────────────────────────────────────────────────

    private String resolveRole(Account account) {
        return accountRoleRepository.findByAccount_AccountId(account.getAccountId())
                .stream().findFirst()
                .map(ar -> ar.getRole().getName())
                .orElse("USER");
    }
}
