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
import com.forum.it.dtos.request.ReactionRequest;
import com.forum.it.dtos.response.ReactionResponse;
import com.forum.it.services.ReactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Reaction.BASE)
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;

    @PostMapping(Routes.Reaction.REACT)
    public ResponseEntity<ReactionResponse> react(
            @PathVariable UUID postId,
            @Valid @RequestBody ReactionRequest request) {
        return ResponseEntity.ok(reactionService.react(postId, request));
    }

    @DeleteMapping(Routes.Reaction.REMOVE)
    public ResponseEntity<Void> removeReaction(@PathVariable UUID postId) {
        reactionService.removeReaction(postId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(Routes.Reaction.REACT)
    public ResponseEntity<Map<String, Object>> getReactions(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReactionResponse> result = reactionService.getReactionsByPost(postId, pageable);
        return ResponseEntity.ok(Map.of(
                "reactions", result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    @GetMapping(Routes.Reaction.COUNT)
    public ResponseEntity<Map<String, Long>> countReactions(@PathVariable UUID postId) {
        return ResponseEntity.ok(Map.of("count", reactionService.countReactionsByPost(postId)));
    }
}