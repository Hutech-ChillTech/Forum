package com.forum.it.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.sercurites.UserPrincipal;
import com.forum.it.services.PresenceService;

import lombok.RequiredArgsConstructor;

/**
 * REST endpoint for client-side presence heartbeat.
 *
 * The frontend calls {@code POST /api/v1/presence/heartbeat} every ~2 minutes
 * and also immediately when the browser tab becomes visible again.
 * This keeps the Redis heartbeat timestamp fresh so the user is not evicted
 * by the stale-user cleanup scheduler.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/presence")
public class PresenceController {

    private final PresenceService presenceService;

    /**
     * Refresh the caller's presence heartbeat.
     * Requires a valid JWT (handled by {@code JwtAuthenticationFilter}).
     */
    @PostMapping("/heartbeat")
    public ResponseEntity<Map<String, Boolean>> heartbeat(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            return ResponseEntity.status(401).body(Map.of("ok", false));
        }
        UUID userId = userPrincipal.getUserId();
        presenceService.heartbeat(userId);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
