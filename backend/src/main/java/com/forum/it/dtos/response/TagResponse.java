package com.forum.it.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.forum.it.entities.tag.Tag;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TagResponse {
    private UUID tagId;
    private String name;
    private String slug;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TagResponse(Tag tag) {
        this.tagId = tag.getTagId();
        this.name = tag.getName();
        this.slug = tag.getSlug();
        this.description = tag.getDescription();
        this.isActive = tag.getIsActive();
        this.createdAt = tag.getCreatedAt();
        this.updatedAt = tag.getUpdatedAt();
    }
}
