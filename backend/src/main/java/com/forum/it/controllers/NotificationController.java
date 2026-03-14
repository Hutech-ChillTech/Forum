package com.forum.it.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.response.NotificationResponse;
import com.forum.it.services.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Notification.BASE)
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping(Routes.Notification.MY_ALL)
    public ResponseEntity<Map<String, Object>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> result = notificationService.getMyNotifications(pageable);
        return ResponseEntity.ok(Map.of(
                "notifications", result.getContent(),
                "totalItems", result.getTotalElements(),
                "totalPages", result.getTotalPages()));
    }

    @GetMapping(Routes.Notification.UNREAD_COUNT)
    public ResponseEntity<Map<String, Long>> countUnread() {
        return ResponseEntity.ok(Map.of("unread", notificationService.countUnread()));
    }

    @PatchMapping(Routes.Notification.MARK_ALL_READ)
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(Routes.Notification.DELETE)
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(Routes.Notification.MY_ALL)
    public ResponseEntity<Void> clearAll() {
        notificationService.clearAllNotifications();
        return ResponseEntity.noContent().build();
    }
}