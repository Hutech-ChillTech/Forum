package com.forum.it.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.request.ShareRequest;
import com.forum.it.dtos.response.ShareResponse;
import com.forum.it.services.ShareService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping(Routes.Share.BASE)
    public ResponseEntity<ShareResponse> sharePost(
            @PathVariable UUID postId,
            @Valid @RequestBody ShareRequest request) {
        return ResponseEntity.ok(shareService.sharePost(postId, request));
    }

    @GetMapping(Routes.Share.BASE)
    public ResponseEntity<Map<String, Object>> getSharesByPost(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ShareResponse> result = shareService.getSharesByPost(postId, pageable);
        return ResponseEntity.ok(Map.of(
                "shares", result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    @GetMapping(Routes.User.BASE + Routes.User.MY_SHARES)
    public ResponseEntity<Map<String, Object>> getMyShares(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ShareResponse> result = shareService.getMyShares(pageable);
        return ResponseEntity.ok(Map.of(
                "shares", result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    @GetMapping(Routes.Share.BASE + Routes.Share.COUNT)
    public ResponseEntity<Map<String, Long>> countShares(@PathVariable UUID postId) {
        return ResponseEntity.ok(Map.of("count", shareService.countSharesByPost(postId)));
    }
}