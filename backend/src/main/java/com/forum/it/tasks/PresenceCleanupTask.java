package com.forum.it.tasks;

import java.util.Map;
import java.util.Set;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.forum.it.services.PresenceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Periodically evicts users whose heartbeat has been silent for longer than
 * {@link PresenceService#STALE_AFTER_SECONDS} seconds and broadcasts offline
 * events to all connected clients so the UI updates in real time.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PresenceCleanupTask {

    private final PresenceService       presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    /** Run every 60 seconds. */
    @Scheduled(fixedDelay = 60_000)
    public void evictStaleUsers() {
        Set<String> evicted = presenceService.evictStaleUsers();
        if (evicted.isEmpty()) return;

        log.debug("Presence cleanup: evicting {} stale user(s)", evicted.size());
        for (String userId : evicted) {
            messagingTemplate.convertAndSend(
                "/topic/presence",
                Map.of("userId", userId, "online", false)
            );
        }
    }
}
