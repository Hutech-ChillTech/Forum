package com.forum.it.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.ModerationActionRequest;
import com.forum.it.dtos.response.ModerationLogResponse;
import com.forum.it.entities.system.ModerationLog;
import com.forum.it.entities.user.User;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.ModerationLogRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ModerationLogService {

    private final ModerationLogRepository moderationLogRepository;
    private final UserRepository          userRepository;
    private final SecurityContextHelper   securityContextHelper;

    public ModerationLogResponse logAction(ModerationActionRequest request) {
        UUID adminId = securityContextHelper.getCurrentUserId();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        User targetUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getTargetUserId()));

        ModerationLog log = new ModerationLog();
        log.setAdmin(admin);
        log.setTargetUser(targetUser);
        log.setAction(request.getAction());
        log.setReason(request.getReason());

        return new ModerationLogResponse(moderationLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public Page<ModerationLogResponse> getLogsByAdmin(UUID adminId, Pageable pageable) {
        return moderationLogRepository
                .findByAdminUserIdOrderByCreatedAtDesc(adminId, pageable)
                .map(ModerationLogResponse::new);
    }

    @Transactional(readOnly = true)
    public Page<ModerationLogResponse> getLogsByTargetUser(UUID targetUserId, Pageable pageable) {
        return moderationLogRepository
                .findByTargetUserUserIdOrderByCreatedAtDesc(targetUserId, pageable)
                .map(ModerationLogResponse::new);
    }

    @Transactional(readOnly = true)
    public Page<ModerationLogResponse> getAllLogs(Pageable pageable) {
        return moderationLogRepository.findAll(pageable).map(ModerationLogResponse::new);
    }
}
