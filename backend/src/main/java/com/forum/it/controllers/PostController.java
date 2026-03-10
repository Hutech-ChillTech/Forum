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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.dtos.request.CreatePostRequest;
import com.forum.it.dtos.request.UpdatePostRequest;
import com.forum.it.dtos.response.PostResponse;
import com.forum.it.entities.post.PostStatus;
import com.forum.it.services.PostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // POST /api/v1/posts
    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody CreatePostRequest request) {
        PostResponse response = postService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/v1/posts
    @GetMapping
    public ResponseEntity<Map<String, Object>> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getPublishedPosts(pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    // GET /api/v1/posts/all
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getAllPosts(pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    // GET /api/v1/posts/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable UUID id) {
        PostResponse response = postService.getPostById(id);
        return ResponseEntity.ok(response);
    }

    // GET /api/v1/posts/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getPostsByUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getPostsByUserId(userId, pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    // GET /api/v1/posts/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getPostsByStatus(
            @PathVariable PostStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getPostsByStatus(status, pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    // GET /api/v1/posts/search?keyword=xxx
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostResponse> postsPage = postService.searchPosts(keyword, pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    // GET /api/v1/posts/recent?days=7
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentPosts(
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostResponse> postsPage = postService.getRecentPosts(days, pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    // PUT /api/v1/posts/{id}?userId=xxx
    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable UUID id,
            @RequestParam UUID userId,
            @Valid @RequestBody UpdatePostRequest request) {
        PostResponse response = postService.updatePost(id, userId, request);
        return ResponseEntity.ok(response);
    }

    // PATCH /api/v1/posts/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<PostResponse> updatePostStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        PostStatus status = PostStatus.valueOf(body.get("status"));
        PostResponse response = postService.updatePostStatus(id, status);
        return ResponseEntity.ok(response);
    }

    // DELETE /api/v1/posts/{id}?userId=xxx
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        postService.deletePost(id, userId);
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/v1/posts/{id}/admin
    @DeleteMapping("/{id}/admin")
    public ResponseEntity<Void> deletePostByAdmin(@PathVariable UUID id) {
        postService.deletePostByAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/v1/posts/statistics/total
    @GetMapping("/statistics/total")
    public ResponseEntity<Map<String, Long>> getTotalPosts() {
        long total = postService.getTotalPosts();
        return ResponseEntity.ok(Map.of("total", total));
    }

    // GET /api/v1/posts/statistics/status/{status}
    @GetMapping("/statistics/status/{status}")
    public ResponseEntity<Map<String, Long>> countPostsByStatus(@PathVariable PostStatus status) {
        long count = postService.countPostsByStatus(status);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // GET /api/v1/posts/statistics/user/{userId}
    @GetMapping("/statistics/user/{userId}")
    public ResponseEntity<Map<String, Long>> countPostsByUser(@PathVariable UUID userId) {
        long count = postService.countPostsByUser(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    private Pageable buildPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equals("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
    }

    private Map<String, Object> buildPageResponse(Page<?> pageData, String dataKey) {
        Map<String, Object> response = new HashMap<>();
        response.put(dataKey, pageData.getContent());
        response.put("currentPage", pageData.getNumber());
        response.put("totalItems", pageData.getTotalElements());
        response.put("totalPages", pageData.getTotalPages());
        response.put("pageSize", pageData.getSize());
        return response;
    }
}
