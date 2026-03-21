package com.forum.it.dtos.request;

import java.util.List;

import jakarta.validation.constraints.Size;

public class UpdatePostRequest {

    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;

    @Size(min = 10, message = "Content must be at least 10 characters")
    private String content;

    private String imageURL;

    private List<String> tagNames;

    public UpdatePostRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getImageURL() { return imageURL; }
    public void setImageURL(String imageURL) { this.imageURL = imageURL; }

    public List<String> getTagNames() { return tagNames; }
    public void setTagNames(List<String> tagNames) { this.tagNames = tagNames; }
}
