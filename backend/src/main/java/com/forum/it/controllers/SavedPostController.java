package com.forum.it.controllers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.response.SavedPostResponse;
import com.forum.it.services.SavedPostService;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SavedPostController {

    private final SavedPostService      savedPostService;
    private final SecurityContextHelper securityContextHelper;

    @PostMapping(Routes.Post.BASE + Routes.Post.BOOKMARK)
    public ResponseEntity<String> bookmark(@PathVariable UUID postId) {
        UUID currentUserId = securityContextHelper.getCurrentUserId();
        savedPostService.bookmarkPost(currentUserId, postId);
        return ResponseEntity.status(HttpStatus.CREATED).body("Saved post successfully");
    }  

    @DeleteMapping(Routes.Post.BASE + Routes.Post.BOOKMARK)
    public ResponseEntity<String> unbookmark(@PathVariable UUID postId) {
        UUID currentUserId = securityContextHelper.getCurrentUserId();
        savedPostService.unbookmarkPost(currentUserId, postId);
        return ResponseEntity.ok("Unsaved post successfully");
    }

    @GetMapping(Routes.User.BASE + Routes.User.MY_BOOKMARKS)
    public ResponseEntity<Page<SavedPostResponse>> getMyBookmarks(Pageable pageable) {
        UUID currentUserId = securityContextHelper.getCurrentUserId();
        Page<SavedPostResponse> result = savedPostService.getMySavedPosts(currentUserId, pageable);
        return ResponseEntity.ok(result);
    }
}