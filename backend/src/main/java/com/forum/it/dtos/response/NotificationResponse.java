package com.forum.it.dtos.response;

import java.time.LocalDate;
import java.util.UUID;

import com.forum.it.entities.system.Notification;
import com.forum.it.entities.system.NotificationStatus;
import com.forum.it.entities.system.NotificationType;

import lombok.Getter;

@Getter
public class NotificationResponse {
    private final UUID notificationId;
    private final UUID userId;
    private final UUID postId;
    private final NotificationType type;
    private final String message;
    private final NotificationStatus status;
    private final LocalDate createdAt;

    public NotificationResponse(Notification n) {
        this.notificationId = n.getNotificationId();
        this.userId         = n.getUser().getUserId();
        this.postId         = n.getPost() != null ? n.getPost().getPostId() : null;
        this.type           = n.getType();
        this.message        = n.getMessage();
        this.status         = n.getStatus();
        this.createdAt      = n.getCreatedAt();
    }
}
