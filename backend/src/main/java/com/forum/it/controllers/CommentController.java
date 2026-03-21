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
import com.forum.it.dtos.request.CreateCommentRequest;
import com.forum.it.dtos.request.UpdateCommentRequest;
import com.forum.it.dtos.response.CommentResponse;
import com.forum.it.services.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Comment.BASE)
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping(Routes.Comment.CREATE)
    public ResponseEntity<CommentResponse> createComment(@Valid @RequestBody CreateCommentRequest request) {
        CommentResponse response = commentService.createComment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(Routes.Comment.BY_POST)
    public ResponseEntity<Map<String, Object>> getCommentsByPost(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,asc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<CommentResponse> commentsPage = commentService.getCommentsByPostId(postId, pageable);
        return ResponseEntity.ok(buildPageResponse(commentsPage, "comments"));
    }

    @GetMapping(Routes.Comment.BY_POST_ALL)
    public ResponseEntity<Map<String, Object>> getAllCommentsByPost(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,asc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<CommentResponse> commentsPage = commentService.getAllCommentsByPostId(postId, pageable);
        return ResponseEntity.ok(buildPageResponse(commentsPage, "comments"));
    }

    @GetMapping(Routes.Comment.GET_BY_ID)
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable UUID id) {
        CommentResponse response = commentService.getCommentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping(Routes.Comment.REPLIES)
    public ResponseEntity<List<CommentResponse>> getReplies(@PathVariable UUID id) {
        List<CommentResponse> replies = commentService.getReplies(id);
        return ResponseEntity.ok(replies);
    }

    @GetMapping(Routes.Comment.BY_USER)
    public ResponseEntity<Map<String, Object>> getCommentsByUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<CommentResponse> commentsPage = commentService.getCommentsByUserId(userId, pageable);
        return ResponseEntity.ok(buildPageResponse(commentsPage, "comments"));
    }

    @PutMapping(Routes.Comment.UPDATE)
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCommentRequest request) {
        CommentResponse response = commentService.updateComment(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping(Routes.Comment.DELETE)
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(Routes.Comment.DELETE_ADMIN)
    public ResponseEntity<Void> deleteCommentByAdmin(@PathVariable UUID id) {
        commentService.deleteCommentByAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(Routes.Comment.COUNT_BY_POST)
    public ResponseEntity<Map<String, Long>> countByPost(@PathVariable UUID postId) {
        long count = commentService.countCommentsByPostId(postId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping(Routes.Comment.COUNT_BY_USER)
    public ResponseEntity<Map<String, Long>> countByUser(@PathVariable UUID userId) {
        long count = commentService.countCommentsByUserId(userId);
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