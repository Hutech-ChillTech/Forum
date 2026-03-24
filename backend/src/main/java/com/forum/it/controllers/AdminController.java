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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.request.CreateUserRequest;
import com.forum.it.dtos.response.CommentResponse;
import com.forum.it.dtos.response.PostResponse;
import com.forum.it.dtos.response.TagResponse;
import com.forum.it.dtos.response.UserResponse;
import com.forum.it.entities.post.PostStatus;
import com.forum.it.services.PostService;
import com.forum.it.services.UserService;
import com.forum.it.services.CommentService;
import com.forum.it.services.TagService;
import com.forum.it.dtos.request.RoleRequest;
import com.forum.it.dtos.response.ApiResponses;
import com.forum.it.services.AccountService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(Routes.Admin.BASE)
public class AdminController {

    final UserService userService;
    final PostService postService;
    final CommentService commentService;
    final TagService tagService;
    final AccountService accountService;

    // User API Endpoints
    @PostMapping(Routes.Admin.CREATE_USER)
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(Routes.Admin.GET_ALL_USER)
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

    @GetMapping(Routes.Admin.GET_BY_ID_USER)
    public ResponseEntity<UserResponse> getById(@PathVariable UUID id) {
        try {
            UserResponse response = userService.getById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping(Routes.Admin.GET_BY_EMAIL_USER)
    public ResponseEntity<UserResponse> getByEmail(@PathVariable String email) {
        try {
            UserResponse response = userService.getByEmail(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping(Routes.Admin.DELETE_USER)
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        try {
            userService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Post API Endpoints
    private Pageable buildPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equals("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
    }

    private Map<String, Object> buildPageResponse(Page<?> page, String key) {
        Map<String, Object> response = new HashMap<>();
        response.put(key, page.getContent());
        response.put("currentPage", page.getNumber());
        response.put("totalItems", page.getTotalElements());
        response.put("totalPages", page.getTotalPages());
        response.put("pageSize", page.getSize());
        return response;
    }

    @GetMapping(Routes.Admin.GET_ALL_POSTS)
    public ResponseEntity<Map<String, Object>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getAllPosts(pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    @GetMapping(Routes.Admin.GET_BY_ID_POST)
    public ResponseEntity<PostResponse> getPostById(@PathVariable UUID id) {
        PostResponse response = postService.getPostById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping(Routes.Admin.GET_BY_STATUS_POST)
    public ResponseEntity<Map<String, Object>> getPostsByStatus(
            @PathVariable PostStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getPostsByStatus(status, pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    @DeleteMapping(Routes.Admin.DELETE_POST)
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    // Comment API Endpoints
    @GetMapping(Routes.Admin.GET_BY_ID_COMMENT)
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable UUID id) {
        CommentResponse response = commentService.getCommentById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping(Routes.Admin.DELETE_COMMENT)
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }

    // Tag API Endpoints
    @GetMapping(Routes.Admin.GET_ALL_TAGS)
    public ResponseEntity<Map<String, Object>> getAllTags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TagResponse> result = tagService.getAllTags(pageable);
        return ResponseEntity.ok(Map.of(
                "tags", result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    @GetMapping(Routes.Admin.GET_BY_ID_TAG)
    public ResponseEntity<TagResponse> getTagById(@PathVariable UUID id) {
        return ResponseEntity.ok(tagService.getTagById(id));
    }

    @PostMapping(Routes.Admin.CREATE_TAG)
    public ResponseEntity<TagResponse> createTag(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        return ResponseEntity.status(HttpStatus.CREATED).body(tagService.createTag(name));
    }

    @DeleteMapping(Routes.Admin.DELETE_TAG)
    public ResponseEntity<Void> deleteTag(@PathVariable UUID id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tags/{id}")
    public ResponseEntity<TagResponse> updateTag(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String name = body.get("name");
        return ResponseEntity.ok(tagService.updateTag(id, name));
    }

    @PostMapping(Routes.Admin.BAN_USER)
    public ResponseEntity<UserResponse> ban(@PathVariable UUID id) {
        return ResponseEntity.ok(accountService.ban(id));
    }

    @PostMapping(Routes.Admin.UNBAN_USER)
    public ResponseEntity<UserResponse> unban(@PathVariable UUID id) {
        return ResponseEntity.ok(accountService.unban(id));
    }

    // Role API Endpoints
    @PostMapping(Routes.Admin.ASSIGN_ROLE)
    public ApiResponses<String> assignRole(@RequestBody @Valid RoleRequest request) {
        accountService.assignRole(request);
        return ApiResponses.success(null, null);
    }
}
