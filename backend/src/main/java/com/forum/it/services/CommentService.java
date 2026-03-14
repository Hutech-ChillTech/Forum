package com.forum.it.services;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.CreateCommentRequest;
import com.forum.it.dtos.request.UpdateCommentRequest;
import com.forum.it.dtos.response.CommentResponse;
import com.forum.it.entities.post.Comment;
import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.PostStatus;
import com.forum.it.entities.user.AccountStatus;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.exceptions.ForbiddenException;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.CommentRepository;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository   commentRepository;
    private final PostRepository      postRepository;
    private final UserRepository      userRepository;
    private final SecurityContextHelper securityContextHelper;

    /**
     * userId is resolved from the JWT — NOT from the request body.
     */
    public CommentResponse createComment(CreateCommentRequest request) {
        Post post = postRepository.findById(Objects.requireNonNull(request.getPostId()))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", request.getPostId()));

        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new AppException(ErrorCode.POST_NOT_PUBLISHED);
        }

        UUID userId = securityContextHelper.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() == AccountStatus.BANNED) {
            throw new AppException(ErrorCode.USER_BANNED);
        }
        if (user.getVerifyStatus() == UserStatus.DELETED) {
            throw new AppException(ErrorCode.USER_DELETED);
        }

        Comment comment = new Comment();
        comment.setContent(request.getContent().trim());
        comment.setPost(post);
        comment.setUser(user);

        if (request.getParentId() != null) {
            Comment parentComment = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.getParentId()));

            if (!parentComment.getPost().getPostId().equals(post.getPostId())) {
                throw new AppException(ErrorCode.COMMENT_WRONG_POST);
            }
            if (parentComment.getParent() != null) {
                throw new AppException(ErrorCode.COMMENT_NESTED_REPLY);
            }
            comment.setParent(parentComment);
        }

        Comment savedComment = commentRepository.save(comment);
        return new CommentResponse(savedComment);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByPostId(UUID postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }
        return commentRepository.findByPostPostIdAndParentIsNull(postId, pageable)
                .map(comment -> new CommentResponse(comment, true));
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getAllCommentsByPostId(UUID postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }
        return commentRepository.findByPostPostId(postId, pageable)
                .map(CommentResponse::new);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getReplies(UUID commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new ResourceNotFoundException("Comment", "id", commentId);
        }
        return commentRepository.findByParentCommentId(commentId)
                .stream().map(CommentResponse::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommentResponse getCommentById(UUID commentId) {
        Comment comment = commentRepository.findById(Objects.requireNonNull(commentId))
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        return new CommentResponse(comment, true);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByUserId(UUID userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return commentRepository.findByUserUserId(userId, pageable).map(CommentResponse::new);
    }

    public CommentResponse updateComment(UUID commentId, UpdateCommentRequest request) {
        Comment comment = commentRepository.findById(Objects.requireNonNull(commentId))
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        UUID currentUserId = securityContextHelper.getCurrentUserId();
        if (!comment.getUser().getUserId().equals(currentUserId)) {
            throw new ForbiddenException("You can only edit your own comments");
        }

        comment.setContent(request.getContent().trim());
        return new CommentResponse(commentRepository.save(comment));
    }

    public void deleteComment(UUID commentId) {
        Comment comment = commentRepository.findById(Objects.requireNonNull(commentId))
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        UUID currentUserId = securityContextHelper.getCurrentUserId();
        boolean isAdmin = securityContextHelper.isModeratorOrAdmin();

        if (!isAdmin && !comment.getUser().getUserId().equals(currentUserId)) {
            throw new ForbiddenException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    public void deleteCommentByAdmin(UUID commentId) {
        Comment comment = commentRepository.findById(Objects.requireNonNull(commentId))
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        commentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public long countCommentsByPostId(UUID postId) {
        return commentRepository.countByPostId(postId);
    }

    @Transactional(readOnly = true)
    public long countCommentsByUserId(UUID userId) {
        return commentRepository.countByUserId(userId);
    }
}

