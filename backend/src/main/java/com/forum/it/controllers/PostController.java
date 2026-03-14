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

import com.forum.it.contants.Routes;
import com.forum.it.dtos.request.CreatePostRequest;
import com.forum.it.dtos.request.UpdatePostRequest;
import com.forum.it.dtos.response.PostResponse;
import com.forum.it.entities.post.PostStatus;
import com.forum.it.services.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Post.BASE)
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping(Routes.Post.CREATE)
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody CreatePostRequest request) {
        PostResponse response = postService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(Routes.Post.GET_ALL)
    public ResponseEntity<Map<String, Object>> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getPublishedPosts(pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    @GetMapping(Routes.Post.GET_ALL_ADMIN)
    public ResponseEntity<Map<String, Object>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getAllPosts(pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    @GetMapping(Routes.Post.GET_BY_ID)
    public ResponseEntity<PostResponse> getPostById(@PathVariable UUID id) {
        PostResponse response = postService.getPostById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping(Routes.Post.GET_BY_USER)
    public ResponseEntity<Map<String, Object>> getPostsByUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getPostsByUserId(userId, pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    @GetMapping(Routes.Post.GET_BY_STATUS)
    public ResponseEntity<Map<String, Object>> getPostsByStatus(
            @PathVariable PostStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<PostResponse> postsPage = postService.getPostsByStatus(status, pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    @GetMapping(Routes.Post.SEARCH)
    public ResponseEntity<Map<String, Object>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostResponse> postsPage = postService.searchPosts(keyword, pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    @GetMapping(Routes.Post.RECENT)
    public ResponseEntity<Map<String, Object>> getRecentPosts(
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostResponse> postsPage = postService.getRecentPosts(days, pageable);
        return ResponseEntity.ok(buildPageResponse(postsPage, "posts"));
    }

    @PutMapping(Routes.Post.UPDATE)
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePostRequest request) {
        PostResponse response = postService.updatePost(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping(Routes.Post.UPDATE_STATUS)
    public ResponseEntity<PostResponse> updatePostStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        PostStatus status = PostStatus.valueOf(body.get("status"));
        PostResponse response = postService.updatePostStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping(Routes.Post.DELETE)
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(Routes.Post.DELETE_ADMIN)
    public ResponseEntity<Void> deletePostByAdmin(@PathVariable UUID id) {
        postService.deletePostByAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(Routes.Post.STATS_TOTAL)
    public ResponseEntity<Map<String, Long>> getTotalPosts() {
        long total = postService.getTotalPosts();
        return ResponseEntity.ok(Map.of("total", total));
    }

    @GetMapping(Routes.Post.STATS_STATUS)
    public ResponseEntity<Map<String, Long>> countPostsByStatus(@PathVariable PostStatus status) {
        long count = postService.countPostsByStatus(status);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping(Routes.Post.STATS_USER)
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