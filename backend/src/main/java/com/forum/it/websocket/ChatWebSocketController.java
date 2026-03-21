package com.forum.it.websocket;

import java.security.Principal;
import java.util.UUID;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.forum.it.dtos.request.SendMessageRequest;
import com.forum.it.dtos.response.MessageResponse;
import com.forum.it.sercurites.UserPrincipal;
import com.forum.it.services.CommunicationService;
import com.forum.it.services.PresenceService;

import lombok.RequiredArgsConstructor;

/**
 * Handles real-time chat messages over STOMP/WebSocket.
 *
 * Flow:
 *  1. Client sends a STOMP message to /app/chat.send
 *  2. Message is saved to the DB via CommunicationService
 *  3. The saved message is pushed to the recipient's private queue:
 *     /user/{receiverId}/queue/messages
 *  4. A copy is echoed back to the sender's queue so they see their own message.
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final CommunicationService  communicationService;
    private final PresenceService       presenceService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        // Validate that the sender is the authenticated user
        // The SecurityContext is populated by WebSocketAuthInterceptor, so
        // CommunicationService#sendMessage will resolve senderId from SecurityContextHelper.
        MessageResponse saved = communicationService.sendMessage(request);

        // Push to recipient's private queue
        messagingTemplate.convertAndSendToUser(
                saved.getReceiverId().toString(),
                "/queue/messages",
                saved);

        // Echo back to sender so their own UI updates immediately
        messagingTemplate.convertAndSendToUser(
                saved.getSenderId().toString(),
                "/queue/messages",
                saved);
    }

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        UserPrincipal principal = extractPrincipal(event.getUser());
        if (principal != null) {
            presenceService.markOnline(principal.getUserId());
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        UserPrincipal principal = extractPrincipal(event.getUser());
        if (principal != null) {
            presenceService.markOffline(principal.getUserId());
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private UserPrincipal extractPrincipal(Principal principal) {
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth
                && auth.getPrincipal() instanceof UserPrincipal userPrincipal) {
            return userPrincipal;
        }
        return null;
    }
}
