package com.forum.it.controllers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.dtos.response.ApiResponses;
import com.forum.it.dtos.response.LikeResponse;
import com.forum.it.services.LikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponses<LikeResponse>> toggleLike(@PathVariable UUID postId) {
        LikeResponse response = likeService.toggleLike(postId);
        return ResponseEntity.ok(ApiResponses.<LikeResponse>builder()
                .result(response)
                .message(response == null ? "Unliked successfully" : "Liked successfully")
                .build());
    }

    @GetMapping("/post/{postId}/status")
    public ResponseEntity<ApiResponses<Boolean>> getLikeStatus(@PathVariable UUID postId) {
        boolean isLiked = likeService.isLikedByCurrentUser(postId);
        return ResponseEntity.ok(ApiResponses.<Boolean>builder()
                .result(isLiked)
                .build());
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponses<Page<LikeResponse>>> getLikesByPost(
            @PathVariable UUID postId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponses.<Page<LikeResponse>>builder()
                .result(likeService.getLikesByPost(postId, pageable))
                .build());
    }

    @GetMapping("/post/{postId}/count")
    public ResponseEntity<ApiResponses<Long>> countLikes(@PathVariable UUID postId) {
        return ResponseEntity.ok(ApiResponses.<Long>builder()
                .result(likeService.countLikesByPost(postId))
                .build());
    }
}
