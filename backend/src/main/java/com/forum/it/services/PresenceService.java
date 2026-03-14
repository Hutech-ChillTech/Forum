package com.forum.it.services;

import java.util.Set;
import java.util.UUID;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * Tracks online users via a Redis set {@code online_users}.
 * A user is added when they connect via WebSocket and removed on disconnect.
 */
@Service
@RequiredArgsConstructor
public class PresenceService {

    private static final String ONLINE_KEY = "online_users";

    private final StringRedisTemplate redisTemplate;

    public void markOnline(UUID userId) {
        redisTemplate.opsForSet().add(ONLINE_KEY, userId.toString());
    }

    public void markOffline(UUID userId) {
        redisTemplate.opsForSet().remove(ONLINE_KEY, userId.toString());
    }

    public boolean isOnline(UUID userId) {
        Boolean member = redisTemplate.opsForSet().isMember(ONLINE_KEY, userId.toString());
        return Boolean.TRUE.equals(member);
    }

    public Set<String> getOnlineUserIds() {
        Set<String> members = redisTemplate.opsForSet().members(ONLINE_KEY);
        return members != null ? members : Set.of();
    }

    public long countOnline() {
        Long count = redisTemplate.opsForSet().size(ONLINE_KEY);
        return count != null ? count : 0L;
    }
}
