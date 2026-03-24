package com.forum.it.websocket;

import java.security.Principal;
import java.util.Map;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.forum.it.dtos.request.SendMessageRequest;
import com.forum.it.dtos.response.MessageResponse;
import com.forum.it.entities.system.MessageStatus;
import com.forum.it.sercurites.UserPrincipal;
import com.forum.it.services.CommunicationService;
import com.forum.it.services.PresenceService;

import lombok.RequiredArgsConstructor;

/**
 * Xử lý real-time chat qua STOMP/WebSocket.
 *
 * ──────────────────────── Luồng xử lý ─────────────────────────────────────
 *
 * 1. Client gửi STOMP frame tới /app/chat.send
 * 2. CommunicationService.sendMessage() kiểm tra mutual follow:
 *    - Mutual follow (bạn bè) → status = NORMAL
 *    - Không mutual follow    → status = PENDING
 * 3. Routing dựa trên status:
 *    ┌─ NORMAL  ─────────────────────────────────────────────────────────────┐
 *    │  Đẩy tới /user/{receiverId}/queue/messages  (inbox chính bên nhận)   │
 *    │  Echo lại /user/{senderId}/queue/messages   (bên gửi thấy ngay)      │
 *    └───────────────────────────────────────────────────────────────────────┘
 *    ┌─ PENDING  ────────────────────────────────────────────────────────────┐
 *    │  Đẩy tới /user/{receiverId}/queue/pending   (Message Requests)       │
 *    │  Echo lại /user/{senderId}/queue/messages   (bên gửi vẫn thấy)      │
 *    └───────────────────────────────────────────────────────────────────────┘
 *
 * 4. Presence:
 *    SessionConnectEvent    → markOnline(userId)
 *    SessionDisconnectEvent → markOffline(userId)
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final CommunicationService  communicationService;
    private final PresenceService       presenceService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        // WebSocket threads don't have SecurityContext set automatically (no @EnableWebSocketSecurity).
        // Populate it from the STOMP session Principal so SecurityContextHelper works.
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        MessageResponse saved = communicationService.sendMessage(request);

        String receiverIdStr = saved.getReceiverId().toString();
        String senderIdStr   = saved.getSenderId().toString();

        if (saved.getStatus() == MessageStatus.NORMAL) {
            // Hai người là bạn bè → đẩy vào inbox chính của cả hai
            messagingTemplate.convertAndSendToUser(receiverIdStr, "/queue/messages", saved);
            messagingTemplate.convertAndSendToUser(senderIdStr,   "/queue/messages", saved);
        } else {
            // Người gửi chưa mutual follow → đẩy vào pending queue của người nhận
            messagingTemplate.convertAndSendToUser(receiverIdStr, "/queue/pending", saved);
            // Echo lại cho người gửi (họ vẫn thấy tin mình đã gửi)
            messagingTemplate.convertAndSendToUser(senderIdStr,   "/queue/messages", saved);
        }
    }

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        UserPrincipal principal = extractPrincipal(event.getUser());
        if (principal != null) {
            presenceService.markOnline(principal.getUserId());
            messagingTemplate.convertAndSend("/topic/presence",
                Map.of("userId", principal.getUserId().toString(), "online", true));
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        UserPrincipal principal = extractPrincipal(event.getUser());
        if (principal != null) {
            presenceService.markOffline(principal.getUserId());
            messagingTemplate.convertAndSend("/topic/presence",
                Map.of("userId", principal.getUserId().toString(), "online", false));
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

