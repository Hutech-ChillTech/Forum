package com.forum.it.dtos.response;

import java.util.UUID;

import com.forum.it.entities.tag.Tag;

import lombok.Getter;

@Getter
public class TagResponse {
    private final UUID tagId;
    private final String name;

    public TagResponse(Tag t) {
        this.tagId = t.getTagId();
        this.name  = t.getName();
    }
}
