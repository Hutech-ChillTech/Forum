package com.forum.it.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.repositories.TagRepository;
import com.forum.it.dtos.request.CreateTagRequest;
import com.forum.it.dtos.request.UpdateTagRequest;
import com.forum.it.dtos.response.TagResponse;
import com.forum.it.entities.tag.Tag;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    @Transactional(readOnly = true)
    public Page<TagResponse> getAll(Pageable pageable) {
        return tagRepository.findAll(pageable).map(TagResponse::new);
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getAll() {
        return tagRepository.findAll().stream().map(TagResponse::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TagResponse getById(UUID id) {
        return tagRepository.findById(id)
                .map(TagResponse::new)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public TagResponse getBySlug(String slug) {
        return tagRepository.findBySlug(slug)
                .map(TagResponse::new)
                .orElseThrow(() -> new RuntimeException("Tag not found with slug: " + slug));
    }

    @Transactional
    public TagResponse create(CreateTagRequest request) {
        if (tagRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tag name already exists: " + request.getName());
        }
        if (tagRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Tag slug already exists: " + request.getSlug());
        }

        Tag tag = new Tag();
        tag.setName(request.getName());
        tag.setSlug(request.getSlug());
        tag.setDescription(request.getDescription());
        tag.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        tag = tagRepository.save(tag);
        return new TagResponse(tag);
    }

    @Transactional
    public TagResponse update(UUID id, UpdateTagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + id));

        if (request.getName() != null && !request.getName().equals(tag.getName())) {
            if (tagRepository.existsByName(request.getName())) {
                throw new RuntimeException("Tag name already exists: " + request.getName());
            }
            tag.setName(request.getName());
        }

        if (request.getSlug() != null && !request.getSlug().equals(tag.getSlug())) {
            if (tagRepository.existsBySlug(request.getSlug())) {
                throw new RuntimeException("Tag slug already exists: " + request.getSlug());
            }
            tag.setSlug(request.getSlug());
        }

        if (request.getDescription() != null) {
            tag.setDescription(request.getDescription());
        }

        if (request.getIsActive() != null) {
            tag.setIsActive(request.getIsActive());
        }

        tag = tagRepository.save(tag);
        return new TagResponse(tag);
    }

    @Transactional
    public void delete(UUID id) {
        if (!tagRepository.existsById(id)) {
            throw new RuntimeException("Tag not found with id: " + id);
        }
        tagRepository.deleteById(id);
    }
}
