package com.forum.it.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.response.NotificationResponse;
import com.forum.it.entities.system.NotificationStatus;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.repositories.NotificationRepository;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SecurityContextHelper  securityContextHelper;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return notificationRepository
                .findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationResponse::new);
    }

    @Transactional(readOnly = true)
    public long countUnread() {
        UUID userId = securityContextHelper.getCurrentUserId();
        return notificationRepository.countByUserUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }

    public void markAllAsRead() {
        UUID userId = securityContextHelper.getCurrentUserId();
        notificationRepository.markAllAsRead(userId, NotificationStatus.READ);
    }

    public void deleteNotification(UUID notificationId) {
        var notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        UUID currentUserId = securityContextHelper.getCurrentUserId();
        if (!notification.getUser().getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        notificationRepository.delete(notification);
    }

    public void clearAllNotifications() {
        UUID userId = securityContextHelper.getCurrentUserId();
        notificationRepository.deleteAllByUserId(userId);
    }
}
