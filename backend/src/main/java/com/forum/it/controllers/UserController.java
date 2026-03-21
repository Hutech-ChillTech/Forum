package com.forum.it.controllers;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.request.CreateUserRequest;
import com.forum.it.dtos.request.UpdateUserRequest;
import com.forum.it.dtos.response.ApiResponses;
import com.forum.it.dtos.response.UserResponse;
import com.forum.it.services.AccountService;
import com.forum.it.services.PresenceService;
import com.forum.it.services.UserService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(Routes.User.BASE)
public class UserController {

    final UserService userService;
    final AccountService accountService;
    final PresenceService presenceService;

    @GetMapping(Routes.User.ME)
    public ApiResponses<UserResponse> getProfile() {
        return ApiResponses.success(accountService.getProfile(), null);
    }

    @PostMapping(Routes.User.CREATE)
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(Routes.User.GET_ALL)
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equals("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<UserResponse> usersPage = userService.getAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("users", usersPage.getContent());
        response.put("currentPage", usersPage.getNumber());
        response.put("totalItems", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());
        response.put("pageSize", usersPage.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping(Routes.User.GET_BY_ID)
    public ResponseEntity<UserResponse> getById(@PathVariable UUID id) {
        try {
            UserResponse response = userService.getById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping(Routes.User.ONLINE)
    public ResponseEntity<Map<String, Boolean>> getOnlineStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(Map.of("online", presenceService.isOnline(id)));
    }

    @GetMapping(Routes.User.GET_BY_EMAIL)
    public ResponseEntity<UserResponse> getByEmail(@PathVariable String email) {
        try {
            UserResponse response = userService.getByEmail(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PutMapping(Routes.User.UPDATE)
    public ResponseEntity<UserResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        try {
            UserResponse response = userService.update(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping(Routes.User.DELETE)
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        try {
            userService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // @PatchMapping("/{id}/status")
    // public ResponseEntity<UserResponse> updateStatus(
    // @PathVariable UUID id,
    // @RequestBody Map<String, String> request) {
    // AccountStatus status = AccountStatus.valueOf(request.get("status"));
    // UserResponse response = userService.updateStatus(id, status);
    // return ResponseEntity.ok(response);
    // }

    // @PatchMapping("/{id}/ban")
    // public ResponseEntity<UserResponse> ban(@PathVariable UUID id) {
    // UserResponse response = userService.banUser(id);
    // return ResponseEntity.ok(response);
    // }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
    // userService.deleteUser(id);
    // return ResponseEntity.noContent().build();
    // }

    // @DeleteMapping("/{id}/soft")
    // public ResponseEntity<UserResponse> softDeleteUser(@PathVariable UUID id) {
    // UserResponse response = userService.softDeleteUser(id);
    // return ResponseEntity.ok(response);
    // }

    // @GetMapping("/search")
    // public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String q)
    // {
    // List<UserResponse> users = userService.searchUsers(q);
    // return ResponseEntity.ok(users);
    // }

    // @GetMapping("/statistics/total")
    // public ResponseEntity<Map<String, Long>> getTotalUsers() {
    // long total = userService.getTotalUsers();
    // return ResponseEntity.ok(Map.of("total", total));
    // }

    // @GetMapping("/statistics/status/{status}")
    // public ResponseEntity<Map<String, Long>> countUsersByStatus(@PathVariable
    // AccountStatus status) {
    // long count = userService.countUsersByStatus(status);
    // return ResponseEntity.ok(Map.of("count", count));
    // }

    // @GetMapping("/check-email/{email}")
    // public ResponseEntity<Map<String, Boolean>> checkEmailExists(@PathVariable
    // String email) {
    // boolean exists = userService.isEmailExists(email);
    // return ResponseEntity.ok(Map.of("exists", exists));
    // }

    // @GetMapping("/check-username/{userName}")
    // public ResponseEntity<Map<String, Boolean>> checkUserNameExists(@PathVariable
    // String userName) {
    // boolean exists = userService.isUserNameExists(userName);
    // return ResponseEntity.ok(Map.of("exists", exists));
    // }
}
