package com.forum.it.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.response.FollowResponse;
import com.forum.it.dtos.response.FollowStatusResponse;
import com.forum.it.services.FollowService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Follow.BASE)
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    /**
     * POST /api/v1/users/{userId}/follow
     * Current user follow userId.
     */
    @PostMapping(Routes.Follow.FOLLOW)
    public ResponseEntity<FollowResponse> follow(@PathVariable UUID userId) {
        return ResponseEntity.ok(followService.follow(userId));
    }

    /**
     * DELETE /api/v1/users/{userId}/follow
     * Current user unfollow userId.
     */
    @DeleteMapping(Routes.Follow.UNFOLLOW)
    public ResponseEntity<Void> unfollow(@PathVariable UUID userId) {
        followService.unfollow(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/users/{userId}/follow/status
     * Trạng thái follow giữa current user và userId.
     */
    @GetMapping(Routes.Follow.STATUS)
    public ResponseEntity<FollowStatusResponse> getFollowStatus(@PathVariable UUID userId) {
        return ResponseEntity.ok(followService.getFollowStatus(userId));
    }

    /**
     * GET /api/v1/users/{userId}/followers
     * Danh sách người đang theo dõi userId.
     */
    @GetMapping(Routes.Follow.FOLLOWERS)
    public ResponseEntity<Map<String, Object>> getFollowers(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FollowResponse> result = followService.getFollowers(userId, pageable);
        return ResponseEntity.ok(Map.of(
                "followers",   result.getContent(),
                "totalItems",  result.getTotalElements(),
                "totalPages",  result.getTotalPages()));
    }

    /**
     * GET /api/v1/users/{userId}/following
     * Danh sách userId đang theo dõi.
     */
    @GetMapping(Routes.Follow.FOLLOWING)
    public ResponseEntity<Map<String, Object>> getFollowing(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FollowResponse> result = followService.getFollowing(userId, pageable);
        return ResponseEntity.ok(Map.of(
                "following",   result.getContent(),
                "totalItems",  result.getTotalElements(),
                "totalPages",  result.getTotalPages()));
    }

    /**
     * GET /api/v1/users/{userId}/friends
     * Danh sách mutual follow (bạn bè) của userId.
     */
    @GetMapping(Routes.Follow.FRIENDS)
    public ResponseEntity<Map<String, Object>> getFriends(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FollowResponse> result = followService.getFriends(userId, pageable);
        return ResponseEntity.ok(Map.of(
                "friends",     result.getContent(),
                "totalItems",  result.getTotalElements(),
                "totalPages",  result.getTotalPages()));
    }

    /**
     * GET /api/v1/users/{userId}/follow/status  (alias for stats)
     * Số lượng followers / following / friends của userId.
     */
    @GetMapping(Routes.Follow.FOLLOWING + "/count")
    public ResponseEntity<Map<String, Long>> getFollowStats(@PathVariable UUID userId) {
        return ResponseEntity.ok(followService.getFollowStats(userId));
    }
}
