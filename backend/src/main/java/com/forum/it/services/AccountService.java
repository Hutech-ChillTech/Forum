package com.forum.it.services;

import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.List;

import com.forum.it.dtos.request.ChangePasswordRequest;
import com.forum.it.dtos.request.CreateUserRequest;
import com.forum.it.dtos.request.LoginRequest;
import com.forum.it.dtos.request.OtpRequest;
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
import com.forum.it.dtos.response.UserResponse;
import com.forum.it.dtos.request.RoleRequest;
import java.util.Collections;
import java.util.Set;
import com.forum.it.repositories.RolePermissionRepository;

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
    OtpService otpService;
    EmailService emailService;
    RolePermissionRepository rolePermissionRepository;

    @Value("${jwt.refresh-token.expiration}")
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

        // 1. Kiểm tra OTP
        if (request.getOtp() == null || request.getOtp().isBlank()) {
            String otp = otpService.generateOtp(request.getEmail());
            emailService.sendOtpEmail(request.getEmail(), otp);
            throw new AppException(ErrorCode.OTP_REQUIRED);
        }

        // 2. Xác thực OTP
        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new AppException(ErrorCode.OTP_INVALID);
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
        account.setIsVerify(AccountVerifyCheck.VERIFY); // Set verified after OTP
        account.setUser(savedUser);

        Account savedAccount = accountRepository.save(account);

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        AccountRole accountRole = new AccountRole();
        accountRole.setAccount(savedAccount);
        accountRole.setRole(userRole);
        accountRoleRepository.save(accountRole);
        Set<String> permissions = getPermissionsByAccount(savedAccount);

        String token = jwtTokenProvider.generateToken(savedAccount, userRole.getName(), permissions);

        return AuthResponse.builder()
                .accessToken(token)
                .authenticated(true)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail());
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_EXIST);
        }

        String roleName = resolveRole(account);
        Set<String> permissions = getPermissionsByAccount(account);
        String accessToken = jwtTokenProvider.generateToken(account, roleName, permissions);
        String refreshToken = jwtTokenProvider.generateRefreshToken(account);

        long iat = jwtTokenProvider.getIssuedAtTime(accessToken);
        long exp = jwtTokenProvider.getExpirationTime(accessToken);

        redisService.setValueWithTTL("RT:" + account.getEmail(), refreshToken, REFRESH_TOKEN_TTL,
                TimeUnit.MILLISECONDS);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .authenticated(true)
                .permissions(permissions)
                .issuedAt(iat)
                .expiredAt(exp)
                .build();
    }

    public void requestOtp(OtpRequest request) {
        String otp = otpService.generateOtp(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otp);
    }

    /**
     * Blacklists the raw JWT string. Call this from the controller where the
     * raw Authorization header value is available.
     */
    public void blacklistToken(String email) {
        redisService.setValueWithTTL("REVOKED_AT:" + email, String.valueOf(System.currentTimeMillis()),
                REFRESH_TOKEN_TTL, TimeUnit.MILLISECONDS);
    }

    /**
     * Blacklists the current access token in Redis (TTL = remaining token lifetime)
     * and clears the refresh token stored on the account.
     */
    @Transactional
    public void logout() {
        UserPrincipal principal = securityContextHelper.getCurrentUser();
        String email = principal.getEmail();

        redisService.deleteValue("RT:" + email);
        blacklistToken(email);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        String userEmail = null;

        try {
            userEmail = jwtTokenProvider.extractUsername(token);
        } catch (Exception e) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        String storedToken = redisService.getValue("RT:" + userEmail);
        if (storedToken == null || !storedToken.equals(token) || !jwtTokenProvider.isTokenValid(token, userEmail)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        Account account = accountRepository.findByEmail(userEmail);

        String roleName = resolveRole(account);
        Set<String> permissions = getPermissionsByAccount(account);
        String newAccessToken = jwtTokenProvider.generateToken(account, roleName, permissions);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(account);

        long iat = jwtTokenProvider.getIssuedAtTime(newAccessToken);
        long exp = jwtTokenProvider.getExpirationTime(newAccessToken);
        // Rotate: invalidate old refresh token immediately
        redisService.setValueWithTTL("RT:" + userEmail, newRefreshToken, REFRESH_TOKEN_TTL, TimeUnit.MILLISECONDS);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .authenticated(true)
                .issuedAt(iat)
                .expiredAt(exp)
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

    public UserResponse getProfile() {
        UserPrincipal principal = securityContextHelper.getCurrentUser();

        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Account account = accountRepository.findByEmail(principal.getEmail());
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        return new UserResponse(account.getUser());
    }

    // ── private ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public String resolveRole(Account account) {
        List<AccountRole> accountRoles = accountRoleRepository.findByAccount_AccountId(account.getAccountId());
        if (accountRoles.stream().anyMatch(ar -> ar.getRole().getName().equals("ADMIN"))) {
            return "ADMIN";
        }

        if (accountRoles.stream().anyMatch(ar -> ar.getRole().getName().equals("MODERATOR"))) {
            return "MODERATOR";
        }
        return accountRoles.stream()
                .findFirst()
                .map(ar -> ar.getRole().getName())
                .orElse("USER");
    }

    @Transactional(readOnly = true)
    public String resolveRoleByEmail(String email) {
        String cacheKey = "ROLE_CACHE:" + email;
        String cacheRole = redisService.getValue(cacheKey);
        if (cacheRole != null) {
            return cacheRole;
        }

        Account account = accountRepository.findByEmail(email);
        String actualRole = (account != null) ? resolveRole(account) : "USER";
        redisService.setValueWithTTL(cacheKey, actualRole, 1, TimeUnit.HOURS);
        return actualRole;
    }

    @Transactional
    public void assignRole(RoleRequest account) {
        String roleName = account.getRoleName();
        Account existingAccount = accountRepository.findById(account.getAccountId())
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        Role newRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        accountRoleRepository.deleteByAccount_AccountId(account.getAccountId());

        AccountRole accountRole = new AccountRole();
        accountRole.setAccount(existingAccount);
        accountRole.setRole(newRole);
        accountRoleRepository.save(accountRole);

        redisService.deleteValue("ROLE_CACHE:" + existingAccount.getEmail());
    }

    public UserResponse ban(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setStatus(AccountStatus.BANNED);
        return new UserResponse(userRepository.save(user));
    }

    public UserResponse unban(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setStatus(AccountStatus.OFFLINE);
        return new UserResponse(userRepository.save(user));
    }

    private Set<String> getPermissionsByAccount(Account account) {
        Set<UUID> roleIds = accountRoleRepository.findByAccount_AccountId(account.getAccountId())
                .stream()
                .map(ar -> ar.getRole().getRoleId())
                .collect(Collectors.toSet());
        if (roleIds.isEmpty())
            return Collections.emptySet();
        return rolePermissionRepository.findByRole_RoleIdIn(roleIds)
                .stream()
                .map(rp -> rp.getPermission().getName())
                .collect(Collectors.toSet());
    }

}
