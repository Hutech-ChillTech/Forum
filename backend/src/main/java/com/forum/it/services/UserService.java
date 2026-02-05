package com.forum.it.services;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.CreateUserRequest;
import com.forum.it.dtos.request.UpdateUserRequest;
import com.forum.it.dtos.response.UserResponse;
import com.forum.it.entities.account.AccountStatus;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;
import com.forum.it.repositories.UserRepository;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        if (userRepository.existsByUserName(request.getUserName())) {
            throw new RuntimeException("Username already exists: " + request.getUserName());
        }

        User user = new User();
        user.setUserName(request.getUserName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setGender(request.getGender());
        user.setPhone(request.getPhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setVerifyStatus(UserStatus.ACTIVE);
        user.setStatus(AccountStatus.OFFLINE);

        User savedUser = userRepository.save(user);

        return new UserResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(Objects.requireNonNull(pageable))
                .map(UserResponse::new);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return new UserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return new UserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUserName(String userName) {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + userName));
        return new UserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByStatus(AccountStatus status) {
        return userRepository.findByStatus(status)
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getActiveUsers(Pageable pageable) {
        return userRepository.findActiveUsers(pageable)
                .map(UserResponse::new);
    }

    public UserResponse updateUser(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (request.getUserName() != null && !request.getUserName().isEmpty()) {
            if (!user.getUserName().equals(request.getUserName())
                    && userRepository.existsByUserName(request.getUserName())) {
                throw new RuntimeException("Username already exists: " + request.getUserName());
            }
            user.setUserName(request.getUserName());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!user.getEmail().equals(request.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getAvatarURL() != null) {
            user.setAvatarURL(request.getAvatarURL());
        }

        User updatedUser = userRepository.save(Objects.requireNonNull(user));
        return new UserResponse(updatedUser);
    }

    public UserResponse updateUserStatus(UUID userId, AccountStatus status) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setStatus(status);
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }

    public UserResponse banUser(UUID userId) {
        return updateUserStatus(userId, AccountStatus.BANNED);
    }

    public UserResponse unbanUser(UUID userId) {
        return updateUserStatus(userId, AccountStatus.OFFLINE);
    }

    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(Objects.requireNonNull(userId))) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        userRepository.deleteById(Objects.requireNonNull(userId));
    }

    public UserResponse softDeleteUser(UUID userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setVerifyStatus(UserStatus.DELETED);
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(String keyword) {
        return userRepository.searchUsers(keyword)
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getTotalUsers() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public long countUsersByStatus(AccountStatus status) {
        return userRepository.countByStatus(status.name());
    }

    @Transactional(readOnly = true)
    public boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean isUserNameExists(String userName) {
        return userRepository.existsByUserName(userName);
    }
}