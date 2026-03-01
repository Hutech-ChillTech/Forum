package com.forum.it.controllers;

import com.forum.it.dtos.response.SavedPostResponse;
import com.forum.it.services.SavedPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SavedPostController {

    private final SavedPostService savedPostService;

    private final com.forum.it.repositories.AccountRepository accountRepository;

    private UUID getCurrentUserId() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();

            String emailStr = null;
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                emailStr = ((org.springframework.security.core.userdetails.UserDetails) principal)
                        .getUsername();
            } else if (principal instanceof String) {
                emailStr = (String) principal;
            }

            if (emailStr != null) {
                try {
                    return UUID.fromString(emailStr);
                } catch (IllegalArgumentException e) {
                    com.forum.it.entities.user.Account acc = accountRepository.findByEmail(emailStr);
                    if (acc != null && acc.getUser() != null) {
                        return acc.getUser().getUserId();
                    }
                }
            }
        }

        throw new org.springframework.security.access.AccessDeniedException(
                "User is not authenticated or token is invalid.");
    }

    // 1. API: Lưu bài viết (Bookmark)
    @PostMapping("/posts/{postId}/bookmarks")
    public ResponseEntity<String> bookmark(@PathVariable UUID postId) {
        UUID currentUserId = getCurrentUserId();
        savedPostService.bookmarkPost(currentUserId, postId);
        return ResponseEntity.status(HttpStatus.CREATED).body("Saved post successfully");
    }

    // 2. API: Bỏ lưu bài viết (Un-bookmark)
    @DeleteMapping("/posts/{postId}/bookmarks")
    public ResponseEntity<String> unbookmark(@PathVariable UUID postId) {
        UUID currentUserId = getCurrentUserId();
        savedPostService.unbookmarkPost(currentUserId, postId);
        return ResponseEntity.status(HttpStatus.OK).body("Unsaved post successfully");
    }

    // 3. API: Lấy danh sách bài đã lưu
    @GetMapping("/users/me/bookmarks")
    public ResponseEntity<Page<SavedPostResponse>> getMyBookmarks(Pageable pageable) {
        UUID currentUserId = getCurrentUserId();
        Page<SavedPostResponse> result = savedPostService.getMySavedPosts(currentUserId, pageable);
        return ResponseEntity.ok(result);
    }
}
