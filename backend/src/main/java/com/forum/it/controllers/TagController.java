package com.forum.it.controllers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
import com.forum.it.dtos.response.TagResponse;
import com.forum.it.services.TagService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Tag.BASE)
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping(Routes.Tag.GET_ALL)
    public ResponseEntity<Map<String, Object>> getAllTags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TagResponse> result = tagService.getAllTags(pageable);
        return ResponseEntity.ok(Map.of(
                "tags", result.getContent(),
                "totalItems", result.getTotalElements()));
    }

    @GetMapping(Routes.Tag.GET_BY_ID)
    public ResponseEntity<TagResponse> getTagById(@PathVariable UUID id) {
        return ResponseEntity.ok(tagService.getTagById(id));
    }

    @GetMapping(Routes.Tag.SEARCH)
    public ResponseEntity<TagResponse> getTagByName(@RequestParam String name) {
        return ResponseEntity.ok(tagService.getTagByName(name));
    }

    @GetMapping(Routes.Tag.BY_POST)
    public ResponseEntity<List<TagResponse>> getTagsByPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(tagService.getTagsByPostId(postId));
    }

    @PostMapping(Routes.Tag.CREATE)
    public ResponseEntity<TagResponse> createTag(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        return ResponseEntity.status(HttpStatus.CREATED).body(tagService.createTag(name));
    }

    @DeleteMapping(Routes.Tag.DELETE)
    public ResponseEntity<Void> deleteTag(@PathVariable UUID id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}