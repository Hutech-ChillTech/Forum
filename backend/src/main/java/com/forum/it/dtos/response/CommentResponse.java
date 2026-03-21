package com.forum.it.dtos.response;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.forum.it.entities.post.Comment;

public class CommentResponse {

    private UUID commentId;
    private String content;
    private UUID postId;
    private UUID userId;
    private String userName;
    private String userAvatarURL;
    private UUID parentId;
    private int replyCount;
    private List<CommentResponse> replies;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    public CommentResponse() {}

    public CommentResponse(Comment comment) {
        this(comment, false);
    }

    public CommentResponse(Comment comment, boolean includeReplies) {
        this.commentId = comment.getCommentId();
        this.content = comment.getContent();
        this.postId = comment.getPost().getPostId();
        this.userId = comment.getUser().getUserId();
        this.userName = comment.getUser().getUserName();
        this.userAvatarURL = comment.getUser().getAvatarURL();
        this.parentId = comment.getParent() != null ? comment.getParent().getCommentId() : null;
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();

        if (includeReplies && comment.getReplies() != null) {
            this.replies = comment.getReplies().stream()
                    .map(CommentResponse::new)
                    .collect(Collectors.toList());
            this.replyCount = this.replies.size();
        } else {
            this.replies = new ArrayList<>();
            this.replyCount = 0;
        }
    }

    // Getters and setters
    public UUID getCommentId() { return commentId; }
    public void setCommentId(UUID commentId) { this.commentId = commentId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public UUID getPostId() { return postId; }
    public void setPostId(UUID postId) { this.postId = postId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserAvatarURL() { return userAvatarURL; }
    public void setUserAvatarURL(String userAvatarURL) { this.userAvatarURL = userAvatarURL; }

    public UUID getParentId() { return parentId; }
    public void setParentId(UUID parentId) { this.parentId = parentId; }

    public int getReplyCount() { return replyCount; }
    public void setReplyCount(int replyCount) { this.replyCount = replyCount; }

    public List<CommentResponse> getReplies() { return replies; }
    public void setReplies(List<CommentResponse> replies) { this.replies = replies; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
}
