package com.forum.it.controllers;

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
import com.forum.it.dtos.response.MessageResponse;
import com.forum.it.services.CommunicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Chat.BASE)
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;

    @PostMapping(Routes.Chat.SEND)
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(communicationService.sendMessage(request));
    }

    @GetMapping(Routes.Chat.CONVERSATION)
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable("userId") UUID otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> result = communicationService.getConversation(otherUserId, pageable);
        return ResponseEntity.ok(Map.of(
                "messages", result.getContent(),
                "totalItems", result.getTotalElements(),
                "totalPages", result.getTotalPages()));
    }

    @GetMapping(Routes.Chat.INBOX)
    public ResponseEntity<Map<String, Object>> getInbox(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> result = communicationService.getInbox(pageable);
        return ResponseEntity.ok(Map.of(
                "messages", result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    @GetMapping(Routes.Chat.SENT)
    public ResponseEntity<Map<String, Object>> getSentMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> result = communicationService.getSentMessages(pageable);
        return ResponseEntity.ok(Map.of(
                "messages", result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    @DeleteMapping(Routes.Chat.DELETE)
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID id) {
        communicationService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}