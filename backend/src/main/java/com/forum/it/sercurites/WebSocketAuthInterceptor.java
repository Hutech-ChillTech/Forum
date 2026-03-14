package com.forum.it.sercurites;

import java.util.List;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import com.forum.it.services.RedisService;

import lombok.RequiredArgsConstructor;

/**
 * Intercepts STOMP CONNECT frames and validates the JWT supplied via
 * the {@code Authorization: Bearer <token>} STOMP header (or {@code ?token=} query param).
 * Sets the Spring Security principal so that {@code @SendToUser} routing works correctly.
 */
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final RedisService     redisService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        String token = resolveToken(accessor);

        if (token == null || jwtTokenProvider.isTokenExpired(token)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "WebSocket authentication failed: missing or expired token");
        }

        if (redisService.hasKey("blacklist:" + token)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "WebSocket authentication failed: token has been revoked");
        }

        UserPrincipal principal = UserPrincipal.fromToken(jwtTokenProvider, token);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        accessor.setUser(auth);
        return message;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String resolveToken(StompHeaderAccessor accessor) {
        // 1. Check STOMP Authorization header
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String header = authHeaders.get(0);
            if (header != null && header.startsWith("Bearer ")) {
                return header.substring(7);
            }
        }

        // 2. Fall back to ?token= query param (useful for SockJS)
        List<String> tokenParams = accessor.getNativeHeader("token");
        if (tokenParams != null && !tokenParams.isEmpty()) {
            return tokenParams.get(0);
        }

        return null;
    }
}
