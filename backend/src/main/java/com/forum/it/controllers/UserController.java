package com.forum.it.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.forum.it.dtos.request.CreateUserRequest;
import com.forum.it.dtos.request.UpdateUserRequest;
import com.forum.it.dtos.response.UserResponse;
import com.forum.it.entities.account.AccountStatus;
import com.forum.it.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equals("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<UserResponse> usersPage = userService.getAllUsers(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("users", usersPage.getContent());
        response.put("currentPage", usersPage.getNumber());
        response.put("totalItems", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());
        response.put("pageSize", usersPage.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/username/{userName}")
    public ResponseEntity<UserResponse> getUserByUserName(@PathVariable String userName) {
        UserResponse response = userService.getUserByUserName(userName);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<UserResponse>> getUsersByStatus(@PathVariable AccountStatus status) {
        List<UserResponse> users = userService.getUsersByStatus(status);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> usersPage = userService.getActiveUsers(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("users", usersPage.getContent());
        response.put("currentPage", usersPage.getNumber());
        response.put("totalItems", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        AccountStatus status = AccountStatus.valueOf(request.get("status"));
        UserResponse response = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/ban")
    public ResponseEntity<UserResponse> banUser(@PathVariable UUID id) {
        UserResponse response = userService.banUser(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/unban")
    public ResponseEntity<UserResponse> unbanUser(@PathVariable UUID id) {
        UserResponse response = userService.unbanUser(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/soft")
    public ResponseEntity<UserResponse> softDeleteUser(@PathVariable UUID id) {
        UserResponse response = userService.softDeleteUser(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String q) {
        List<UserResponse> users = userService.searchUsers(q);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/statistics/total")
    public ResponseEntity<Map<String, Long>> getTotalUsers() {
        long total = userService.getTotalUsers();
        return ResponseEntity.ok(Map.of("total", total));
    }

    @GetMapping("/statistics/status/{status}")
    public ResponseEntity<Map<String, Long>> countUsersByStatus(@PathVariable AccountStatus status) {
        long count = userService.countUsersByStatus(status);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@PathVariable String email) {
        boolean exists = userService.isEmailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/check-username/{userName}")
    public ResponseEntity<Map<String, Boolean>> checkUserNameExists(@PathVariable String userName) {
        boolean exists = userService.isUserNameExists(userName);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
