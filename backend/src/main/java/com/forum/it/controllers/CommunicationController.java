package com.forum.it.controllers;

import java.util.List;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.request.SendMessageRequest;
import com.forum.it.dtos.response.ConversationSummaryResponse;
import com.forum.it.dtos.response.MessageResponse;
import com.forum.it.services.CommunicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Chat.BASE)
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;

    // ── Gửi tin nhắn ────────────────────────────────────────────────────────

    /**
     * POST /api/v1/messages
     * Gửi tin nhắn qua HTTP (fallback / REST test).
     * Nếu hai người chưa mutual follow → status = PENDING.
     */
    @PostMapping(Routes.Chat.SEND)
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(communicationService.sendMessage(request));
    }

    // ── Hội thoại ────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/messages/conversations
     * Danh sách cuộc trò chuyện NORMAL của current user (sidebar chat).
     */
    @GetMapping(Routes.Chat.CONVERSATIONS)
    public ResponseEntity<List<ConversationSummaryResponse>> getConversations() {
        return ResponseEntity.ok(communicationService.getConversations());
    }

    /**
     * GET /api/v1/messages/conversation/{userId}
     * Lịch sử toàn bộ tin nhắn với userId (tất cả status).
     */
    @GetMapping(Routes.Chat.CONVERSATION)
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable("userId") UUID otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> result = communicationService.getConversation(otherUserId, pageable);
        return ResponseEntity.ok(Map.of(
                "messages",    result.getContent(),
                "totalItems",  result.getTotalElements(),
                "totalPages",  result.getTotalPages()));
    }

    /**
     * GET /api/v1/messages/inbox
     * Tin nhắn NORMAL nhận được (inbox chính, phân trang).
     */
    @GetMapping(Routes.Chat.INBOX)
    public ResponseEntity<Map<String, Object>> getInbox(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> result = communicationService.getInbox(pageable);
        return ResponseEntity.ok(Map.of(
                "messages",   result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    /**
     * GET /api/v1/messages/sent
     * Tin nhắn NORMAL đã gửi (phân trang).
     */
    @GetMapping(Routes.Chat.SENT)
    public ResponseEntity<Map<String, Object>> getSentMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> result = communicationService.getSentMessages(pageable);
        return ResponseEntity.ok(Map.of(
                "messages",   result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    // ── Pending Message Requests ─────────────────────────────────────────────

    /**
     * GET /api/v1/messages/pending
     * Danh sách user đang có tin nhắn PENDING gửi đến current user.
     */
    @GetMapping(Routes.Chat.PENDING)
    public ResponseEntity<List<ConversationSummaryResponse>> getPendingRequestSenders() {
        return ResponseEntity.ok(communicationService.getPendingRequestSenders());
    }

    /**
     * GET /api/v1/messages/pending/conversation/{senderId}
     * Xem trước nội dung tin nhắn PENDING từ senderId.
     */
    @GetMapping(Routes.Chat.PENDING_CONVERSATION)
    public ResponseEntity<List<MessageResponse>> getPendingConversation(
            @PathVariable UUID senderId) {
        return ResponseEntity.ok(communicationService.getPendingConversation(senderId));
    }

    /**
     * POST /api/v1/messages/pending/{senderId}/accept
     * Chấp nhận tin nhắn từ senderId (PENDING → NORMAL).
     */
    @PostMapping(Routes.Chat.PENDING_ACCEPT)
    public ResponseEntity<Map<String, Object>> acceptPending(@PathVariable UUID senderId) {
        int count = communicationService.acceptPending(senderId);
        return ResponseEntity.ok(Map.of("accepted", count));
    }

    /**
     * DELETE /api/v1/messages/pending/{senderId}/reject
     * Từ chối và xoá tin nhắn PENDING từ senderId.
     */
    @DeleteMapping(Routes.Chat.PENDING_REJECT)
    public ResponseEntity<Void> rejectPending(@PathVariable UUID senderId) {
        communicationService.rejectPending(senderId);
        return ResponseEntity.noContent().build();
    }

    // ── Xoá tin nhắn ────────────────────────────────────────────────────────

    /**
     * DELETE /api/v1/messages/{id}
     * Xoá một tin nhắn (chỉ người gửi mới được xoá).
     */
    @DeleteMapping(Routes.Chat.DELETE)
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID id) {
        communicationService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}
