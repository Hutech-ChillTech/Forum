package com.forum.it.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.SendMessageRequest;
import com.forum.it.dtos.response.MessageResponse;
import com.forum.it.entities.system.Communication;
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
    private final SecurityContextHelper   securityContextHelper;

    public MessageResponse sendMessage(SendMessageRequest request) {
        UUID senderId = securityContextHelper.getCurrentUserId();

        if (senderId.equals(request.getReceiverId())) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getReceiverId()));

        Communication msg = new Communication();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setMessage(SanitizationUtil.stripHtml(request.getMessage()));

        return new MessageResponse(communicationRepository.save(msg));
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> getConversation(UUID otherUserId, Pageable pageable) {
        UUID currentUserId = securityContextHelper.getCurrentUserId();
        return communicationRepository
                .findConversation(currentUserId, otherUserId, pageable)
                .map(MessageResponse::new);
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> getInbox(Pageable pageable) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return communicationRepository
                .findByReceiverUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(MessageResponse::new);
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> getSentMessages(Pageable pageable) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return communicationRepository
                .findBySenderUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(MessageResponse::new);
    }

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
