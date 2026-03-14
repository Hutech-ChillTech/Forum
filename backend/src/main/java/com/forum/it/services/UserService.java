package com.forum.it.services;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.repositories.UserRepository;
import com.forum.it.repositories.AccountRepository;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;

import com.forum.it.dtos.response.*;
import com.forum.it.dtos.request.*;
import com.forum.it.entities.user.AccountStatus;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, AccountRepository accountRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAll(Pageable pageable) {
        try {
            return userRepository.findAll(pageable)
                    .map(UserResponse::new);
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getById(UUID id) {
        try {
            return userRepository.findById(id).map(UserResponse::new)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        try {
            return userRepository.findByEmail(email).map(UserResponse::new)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public UserResponse create(CreateUserRequest request) {
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.NOT_FOUND);
            }

            if (userRepository.existsByUserName(request.getUserName())) {
                throw new AppException(ErrorCode.NOT_FOUND);
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
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public UserResponse update(UUID id, UpdateUserRequest request) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            if (request.getUserName() != null && !request.getUserName().isEmpty()) {
                if (!user.getUserName().equals(request.getUserName()) &&
                        userRepository.existsByUserName(request.getUserName())) {
                    throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
                }
                user.setUserName(request.getUserName());
            }
            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                if (!user.getEmail().equals(request.getEmail()) &&
                        userRepository.existsByEmail(request.getEmail())) {
                    throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
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
            User updatedUser = userRepository.save(user);
            return new UserResponse(updatedUser);
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public UserResponse delete(UUID id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            userRepository.delete(user);
            return new UserResponse(user);
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getByUserName(String userName) {
        try {
            return userRepository.findByUserName(userName).map(UserResponse::new)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getByStatus(AccountStatus status) {
        try {
            return userRepository.findByStatus(status)
                    .stream().map(UserResponse::new)
                    .collect(Collectors.toList());
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getActiveUsers(Pageable pageable) {
        try {
            return userRepository.findActiveUsers(pageable)
                    .map(UserResponse::new);
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<UserResponse> search(String keyword) {
        try {
            return userRepository.searchUsers(keyword)
                    .stream().map(UserResponse::new)
                    .collect(Collectors.toList());
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public long countByStatus(AccountStatus status) {
        try {
            return userRepository.countByStatus(status.name());
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public long getTotal() {
        try {
            return userRepository.count();
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        try {
            return userRepository.existsByEmail(email);
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public boolean existsByUserName(String userName) {
        try {
            return userRepository.existsByUserName(userName);
        } catch (AppException e) {
            throw e;
        }
    }
}
