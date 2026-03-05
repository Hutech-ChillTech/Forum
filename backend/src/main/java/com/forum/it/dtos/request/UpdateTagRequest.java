package com.forum.it.dtos.request;

import lombok.Data;

@Data
public class UpdateTagRequest {
    private String name;
    private String slug;
    private String description;
    private Boolean isActive;
}
