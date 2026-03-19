package com.forum.it.controllers;

import com.forum.it.contants.Routes;
import com.forum.it.services.PostLikeService;
import com.forum.it.utils.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(Routes.PostLike.BASE)
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;
    private final SecurityContextHelper securityContextHelper;

    @PostMapping
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable("postId") UUID postId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(postLikeService.toggleLike(postId, userId));
    }

    @GetMapping(Routes.PostLike.INFO)
    public ResponseEntity<Map<String, Object>> getLikeInfo(@PathVariable("postId") UUID postId) {
        UUID userId = null;
        try {
            userId = securityContextHelper.getCurrentUserId();
        } catch (Exception e) {
            // Unauthenticated
        }
        return ResponseEntity.ok(postLikeService.getLikeInfo(postId, userId));
    }
}
