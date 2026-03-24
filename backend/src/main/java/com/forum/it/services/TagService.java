package com.forum.it.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.response.TagResponse;
import com.forum.it.entities.tag.Tag;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.repositories.PostTagRepository;
import com.forum.it.repositories.TagRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class TagService {

    private final TagRepository     tagRepository;
    private final PostTagRepository postTagRepository;

    @Transactional(readOnly = true)
    public Page<TagResponse> getAllTags(Pageable pageable) {
        return tagRepository.findAll(pageable).map(TagResponse::new);
    }

    @Transactional(readOnly = true)
    public TagResponse getTagById(UUID tagId) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND));
        return new TagResponse(tag);
    }

    @Transactional(readOnly = true)
    public TagResponse getTagByName(String name) {
        Tag tag = tagRepository.findByName(name.trim().toLowerCase())
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND));
        return new TagResponse(tag);
    }

    public TagResponse createTag(String name) {
        String normalizedName = name.trim().toLowerCase();
        if (tagRepository.existsByName(normalizedName)) {
            throw new AppException(ErrorCode.TAG_ALREADY_EXISTS);
        }
        Tag tag = new Tag();
        tag.setName(normalizedName);
        return new TagResponse(tagRepository.save(tag));
    }

    public void deleteTag(UUID tagId) {
        if (!tagRepository.existsById(tagId)) {
            throw new AppException(ErrorCode.TAG_NOT_FOUND);
        }
        postTagRepository.deleteAll(postTagRepository.findByTagTagId(tagId));
        tagRepository.deleteById(tagId);
    }

    public TagResponse updateTag(UUID tagId, String name) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND));
        
        String normalizedName = name.trim().toLowerCase();
        if (tagRepository.existsByName(normalizedName) && !tag.getName().equals(normalizedName)) {
            throw new AppException(ErrorCode.TAG_ALREADY_EXISTS);
        }
        
        tag.setName(normalizedName);
        return new TagResponse(tagRepository.save(tag));
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getTagsByPostId(UUID postId) {
        return postTagRepository.findTagNamesByPostId(postId).stream()
                .flatMap(name -> tagRepository.findByName(name).stream())
                .map(TagResponse::new)
                .collect(Collectors.toList());
    }
}
