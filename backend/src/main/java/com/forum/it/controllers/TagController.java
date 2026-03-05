package com.forum.it.controllers;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.dtos.request.CreateTagRequest;
import com.forum.it.dtos.request.UpdateTagRequest;
import com.forum.it.dtos.response.TagResponse;
import com.forum.it.services.TagService;
import com.forum.it.contants.Routes;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(Routes.Tag.BASE)
public class TagController {

    TagService tagService;

    @PostMapping(Routes.Tag.CREATE)
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody CreateTagRequest request) {
        TagResponse response = tagService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(Routes.Tag.GET_ALL)
    public ResponseEntity<Map<String, Object>> getAllTags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equals("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<TagResponse> tagsPage = tagService.getAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("tags", tagsPage.getContent());
        response.put("currentPage", tagsPage.getNumber());
        response.put("totalItems", tagsPage.getTotalElements());
        response.put("totalPages", tagsPage.getTotalPages());
        response.put("pageSize", tagsPage.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping(Routes.Tag.GET_BY_ID)
    public ResponseEntity<TagResponse> getTagById(@PathVariable UUID id) {
        try {
            TagResponse response = tagService.getById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping(Routes.Tag.GET_BY_SLUG)
    public ResponseEntity<TagResponse> getTagBySlug(@PathVariable String slug) {
        try {
            TagResponse response = tagService.getBySlug(slug);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping(Routes.Tag.UPDATE)
    public ResponseEntity<TagResponse> updateTag(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTagRequest request) {
        try {
            TagResponse response = tagService.update(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping(Routes.Tag.DELETE)
    public ResponseEntity<Void> deleteTag(@PathVariable UUID id) {
        try {
            tagService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
