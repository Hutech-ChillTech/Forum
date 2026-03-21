package com.forum.it.services;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.SendMessageRequest;
import com.forum.it.dtos.response.ConversationSummaryResponse;
import com.forum.it.dtos.response.MessageResponse;
import com.forum.it.entities.system.Communication;
import com.forum.it.entities.system.MessageStatus;
import com.forum.it.entities.user.User;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.CommunicationRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.utils.SanitizationUtil;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CommunicationService {

    private final CommunicationRepository communicationRepository;
    private final UserRepository          userRepository;
    private final FollowService           followService;
    private final PresenceService         presenceService;
    private final SecurityContextHelper   securityContextHelper;

    // ── Gửi tin nhắn ────────────────────────────────────────────────────────

    /**
     * Gửi tin nhắn.
     * - Nếu hai người mutual follow → status = NORMAL (inbox chính)
     * - Nếu không mutual follow     → status = PENDING (Message Requests)
     */
    public MessageResponse sendMessage(SendMessageRequest request) {
        UUID senderId = securityContextHelper.getCurrentUserId();

        if (senderId.equals(request.getReceiverId())) {
            throw new AppException(ErrorCode.CANNOT_MESSAGE_SELF);
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getReceiverId()));

        boolean isMutual = followService.isMutualFollow(senderId, request.getReceiverId());
        MessageStatus status = isMutual ? MessageStatus.NORMAL : MessageStatus.PENDING;

        Communication msg = new Communication();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setMessage(SanitizationUtil.stripHtml(request.getMessage()));
        msg.setStatus(status);

        return new MessageResponse(communicationRepository.save(msg));
    }

    // ── Hội thoại ────────────────────────────────────────────────────────────

    /** Lịch sử toàn bộ tin nhắn giữa current user và otherUserId (không lọc status) */
    @Transactional(readOnly = true)
    public Page<MessageResponse> getConversation(UUID otherUserId, Pageable pageable) {
        UUID currentUserId = securityContextHelper.getCurrentUserId();
        return communicationRepository
                .findConversation(currentUserId, otherUserId, pageable)
                .map(MessageResponse::new);
    }

    /** Danh sách conversations NORMAL (sidebar chat) */
    @Transactional(readOnly = true)
    public List<ConversationSummaryResponse> getConversations() {
        UUID userId = securityContextHelper.getCurrentUserId();

        List<User> senders   = communicationRepository.findDistinctSendersWithStatus(userId, MessageStatus.NORMAL);
        List<User> receivers = communicationRepository.findDistinctReceiversWithStatus(userId, MessageStatus.NORMAL);

        // Gộp và loại trùng theo userId
        Set<UUID> seen = new LinkedHashSet<>();
        List<User> all = new ArrayList<>();
        for (User u : senders) {
            if (seen.add(u.getUserId())) all.add(u);
        }
        for (User u : receivers) {
            if (seen.add(u.getUserId())) all.add(u);
        }

        // Bỏ chính mình ra (an toàn)
        all.removeIf(u -> u.getUserId().equals(userId));

        return all.stream()
                .map(u -> new ConversationSummaryResponse(u, presenceService.isOnline(u.getUserId())))
                .toList();
    }

    /** Inbox NORMAL (tin nhắn thường nhận được) */
    @Transactional(readOnly = true)
    public Page<MessageResponse> getInbox(Pageable pageable) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return communicationRepository
                .findByReceiverUserIdAndStatusOrderByCreatedAtDesc(userId, MessageStatus.NORMAL, pageable)
                .map(MessageResponse::new);
    }

    /** Tin đã gửi NORMAL */
    @Transactional(readOnly = true)
    public Page<MessageResponse> getSentMessages(Pageable pageable) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return communicationRepository
                .findBySenderUserIdAndStatusOrderByCreatedAtDesc(userId, MessageStatus.NORMAL, pageable)
                .map(MessageResponse::new);
    }

    // ── Pending Message Requests ─────────────────────────────────────────────

    /**
     * Danh sách user đang có tin nhắn PENDING gửi đến current user.
     * Frontend dùng để hiển thị "Message Requests" sidebar.
     */
    @Transactional(readOnly = true)
    public List<ConversationSummaryResponse> getPendingRequestSenders() {
        UUID userId = securityContextHelper.getCurrentUserId();
        List<User> senders = communicationRepository
                .findDistinctPendingSenders(userId, MessageStatus.PENDING);
        return senders.stream()
                .map(u -> new ConversationSummaryResponse(u, presenceService.isOnline(u.getUserId())))
                .toList();
    }

    /**
     * Xem trước nội dung tin nhắn PENDING từ senderId (trước khi accept/reject).
     */
    @Transactional(readOnly = true)
    public List<MessageResponse> getPendingConversation(UUID senderId) {
        UUID receiverId = securityContextHelper.getCurrentUserId();
        return communicationRepository
                .findPendingConversation(senderId, receiverId)
                .stream().map(MessageResponse::new).toList();
    }

    /**
     * Chấp nhận tin nhắn từ senderId:
     * - Tất cả PENDING → NORMAL
     */
    public int acceptPending(UUID senderId) {
        UUID receiverId = securityContextHelper.getCurrentUserId();
        int updated = communicationRepository.acceptPendingMessages(senderId, receiverId);
        if (updated == 0) {
            throw new AppException(ErrorCode.PENDING_REQUEST_NOT_FOUND);
        }
        return updated;
    }

    /**
     * Từ chối (xoá) tin nhắn PENDING từ senderId.
     */
    public void rejectPending(UUID senderId) {
        UUID receiverId = securityContextHelper.getCurrentUserId();
        if (!communicationRepository.existsBySenderUserIdAndReceiverUserIdAndStatus(
                senderId, receiverId, MessageStatus.PENDING)) {
            throw new AppException(ErrorCode.PENDING_REQUEST_NOT_FOUND);
        }
        communicationRepository.rejectPendingMessages(senderId, receiverId);
    }

    // ── Xoá tin nhắn ────────────────────────────────────────────────────────

    /** Chỉ người gửi mới được xoá tin nhắn của mình */
    public void deleteMessage(UUID messageId) {
        Communication msg = communicationRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        UUID currentUserId = securityContextHelper.getCurrentUserId();
        if (!msg.getSender().getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        communicationRepository.delete(msg);
    }
}

