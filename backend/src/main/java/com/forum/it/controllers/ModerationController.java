package com.forum.it.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.request.ModerationActionRequest;
import com.forum.it.dtos.response.ModerationLogResponse;
import com.forum.it.services.ModerationLogService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Moderation.BASE)
@RequiredArgsConstructor
public class ModerationController {

    private final ModerationLogService moderationLogService;

    @PostMapping(Routes.Moderation.LOG_ACTION)
    public ResponseEntity<ModerationLogResponse> logAction(
            @Valid @RequestBody ModerationActionRequest request) {
        return ResponseEntity.ok(moderationLogService.logAction(request));
    }

    @GetMapping(Routes.Moderation.GET_ALL)
    public ResponseEntity<Map<String, Object>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ModerationLogResponse> result = moderationLogService.getAllLogs(pageable);
        return ResponseEntity.ok(Map.of(
                "logs", result.getContent(),
                "totalItems", result.getTotalElements(),
                "totalPages", result.getTotalPages()));
    }

    @GetMapping(Routes.Moderation.BY_ADMIN)
    public ResponseEntity<Map<String, Object>> getLogsByAdmin(
            @PathVariable UUID adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ModerationLogResponse> result = moderationLogService.getLogsByAdmin(adminId, pageable);
        return ResponseEntity.ok(Map.of(
                "logs", result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    @GetMapping(Routes.Moderation.BY_TARGET)
    public ResponseEntity<Map<String, Object>> getLogsByTargetUser(
            @PathVariable("userId") UUID targetUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ModerationLogResponse> result = moderationLogService.getLogsByTargetUser(targetUserId, pageable);
        return ResponseEntity.ok(Map.of(
                "logs", result.getContent(),
                "totalItems", result.getTotalElements()));
    }
}