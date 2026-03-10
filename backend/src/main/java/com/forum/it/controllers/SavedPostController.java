package com.forum.it.controllers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.dtos.response.SavedPostResponse;
import com.forum.it.repositories.AccountRepository;
import com.forum.it.services.SavedPostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SavedPostController {

    private final SavedPostService savedPostService;
    private final AccountRepository accountRepository;

    private UUID getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();

            String emailStr = null;
            if (principal instanceof UserDetails) {
                emailStr = ((UserDetails) principal).getUsername();
            } else if (principal instanceof String) {
                emailStr = (String) principal;
            }

            if (emailStr != null) {
                try {
                    return UUID.fromString(emailStr);
                } catch (IllegalArgumentException e) {
                    var acc = accountRepository.findByEmail(emailStr);
                    if (acc != null && acc.getUser() != null) {
                        return acc.getUser().getUserId();
                    }
                }
            }
        }

        throw new AccessDeniedException("User is not authenticated or token is invalid.");
    }

    // POST /api/v1/posts/{postId}/bookmarks
    @PostMapping("/posts/{postId}/bookmarks")
    public ResponseEntity<String> bookmark(@PathVariable UUID postId) {
        UUID currentUserId = getCurrentUserId();
        savedPostService.bookmarkPost(currentUserId, postId);
        return ResponseEntity.status(HttpStatus.CREATED).body("Saved post successfully");
    }

    // DELETE /api/v1/posts/{postId}/bookmarks
    @DeleteMapping("/posts/{postId}/bookmarks")
    public ResponseEntity<String> unbookmark(@PathVariable UUID postId) {
        UUID currentUserId = getCurrentUserId();
        savedPostService.unbookmarkPost(currentUserId, postId);
        return ResponseEntity.ok("Unsaved post successfully");
    }

    // GET /api/v1/users/me/bookmarks
    @GetMapping("/users/me/bookmarks")
    public ResponseEntity<Page<SavedPostResponse>> getMyBookmarks(Pageable pageable) {
        UUID currentUserId = getCurrentUserId();
        Page<SavedPostResponse> result = savedPostService.getMySavedPosts(currentUserId, pageable);
        return ResponseEntity.ok(result);
    }
}
