package com.forum.it.services;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * Tracks online users via two Redis structures:
 *   online_users       – Set of currently online user IDs
 *   user_heartbeats    – ZSet with timestamp scores (epoch seconds) per user
 *
 * A user is online when they connect via WebSocket (or ping the heartbeat endpoint).
 * They are evicted as stale when no heartbeat arrives for {@value #STALE_AFTER_SECONDS} seconds.
 */
@Service
@RequiredArgsConstructor
public class PresenceService {

    private static final String ONLINE_KEY    = "online_users";
    private static final String HEARTBEAT_KEY = "user_heartbeats";
    /** 15 minutes */
    public  static final long   STALE_AFTER_SECONDS = 900L;

    private final StringRedisTemplate redisTemplate;

    /** Mark user online and record a fresh heartbeat timestamp. */
    public void markOnline(UUID userId) {
        String id = userId.toString();
        redisTemplate.opsForSet().add(ONLINE_KEY, id);
        redisTemplate.opsForZSet().add(HEARTBEAT_KEY, id, now());
    }

    /** Refresh heartbeat without changing set membership. */
    public void heartbeat(UUID userId) {
        String id = userId.toString();
        // Add also ensures membership in case they reconnected without a full CONNECT event
        redisTemplate.opsForSet().add(ONLINE_KEY, id);
        redisTemplate.opsForZSet().add(HEARTBEAT_KEY, id, now());
    }

    /** Mark user offline immediately (WebSocket DISCONNECT). */
    public void markOffline(UUID userId) {
        String id = userId.toString();
        redisTemplate.opsForSet().remove(ONLINE_KEY, id);
        redisTemplate.opsForZSet().remove(HEARTBEAT_KEY, id);
    }

    public boolean isOnline(UUID userId) {
        Double score = redisTemplate.opsForZSet().score(HEARTBEAT_KEY, userId.toString());
        if (score == null) return false;
        return (now() - score.longValue()) <= STALE_AFTER_SECONDS;
    }

    public Set<String> getOnlineUserIds() {
        Set<String> members = redisTemplate.opsForSet().members(ONLINE_KEY);
        return members != null ? members : Set.of();
    }

    public long countOnline() {
        Long count = redisTemplate.opsForSet().size(ONLINE_KEY);
        return count != null ? count : 0L;
    }

    /**
     * Remove users whose last heartbeat is older than {@value #STALE_AFTER_SECONDS} seconds
     * from the online set.
     *
     * @return Set of user-ID strings that were evicted (so caller can broadcast offline events)
     */
    public Set<String> evictStaleUsers() {
        long cutoff = now() - STALE_AFTER_SECONDS;
        // ZSet members with score in [0, cutoff] are stale
        Set<String> stale = redisTemplate.opsForZSet().rangeByScore(HEARTBEAT_KEY, 0, cutoff);
        if (stale == null || stale.isEmpty()) return Set.of();

        for (String id : stale) {
            redisTemplate.opsForSet().remove(ONLINE_KEY, id);
            redisTemplate.opsForZSet().remove(HEARTBEAT_KEY, id);
        }
        return stale;
    }

    // ── helper ───────────────────────────────────────────────────────────────

    private static long now() {
        return Instant.now().getEpochSecond();
    }
}
