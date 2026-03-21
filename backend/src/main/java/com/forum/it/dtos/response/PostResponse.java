package com.forum.it.dtos.response;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.PostStatus;

public class PostResponse {

    private UUID postId;
    private String title;
    private String content;
    private String imageURL;
    private PostStatus status;
    private UUID userId;
    private String userName;
    private String userAvatarURL;
    private int commentCount;
    private int countLike;
    private List<String> tags;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    public PostResponse() {
    }

    public PostResponse(Post post, List<String> tagNames) {
        this.postId = post.getPostId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.imageURL = post.getImageURL();
        this.status = post.getStatus();
        this.userId = post.getUser().getUserId();
        this.userName = post.getUser().getUserName();
        this.userAvatarURL = post.getUser().getAvatarURL();
        this.commentCount = post.getComments() != null ? post.getComments().size() : 0;
        this.countLike = post.getCountLike();
        this.tags = tagNames != null ? tagNames : new ArrayList<>();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }

    public PostResponse(Post post) {
        this(post, new ArrayList<>());
    }

    // Getters and setters
    public UUID getPostId() {
        return postId;
    }

    public void setPostId(UUID postId) {
        this.postId = postId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageURL() {
        return imageURL;
    }

    public void setImageURL(String imageURL) {
        this.imageURL = imageURL;
    }

    public PostStatus getStatus() {
        return status;
    }

    public void setStatus(PostStatus status) {
        this.status = status;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserAvatarURL() {
        return userAvatarURL;
    }

    public void setUserAvatarURL(String userAvatarURL) {
        this.userAvatarURL = userAvatarURL;
    }

    public int getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(int commentCount) {
        this.commentCount = commentCount;
    }

    public int getCountLike() {
        return countLike;
    }

    public void setCountLike(int countLike) {
        this.countLike = countLike;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDate updatedAt) {
        this.updatedAt = updatedAt;
    }
}
