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

    @GetMapping(Routes.Tag.SEARCH)
    public ResponseEntity<TagResponse> getTagByName(@RequestParam String name) {
        return ResponseEntity.ok(tagService.getTagByName(name));
    }

    @GetMapping(Routes.Tag.BY_POST)
    public ResponseEntity<List<TagResponse>> getTagsByPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(tagService.getTagsByPostId(postId));
    }
}