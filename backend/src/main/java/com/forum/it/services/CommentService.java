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
import com.forum.it.exceptions.BadRequestException;
import com.forum.it.exceptions.ForbiddenException;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.CommentRepository;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.UserRepository;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse createComment(CreateCommentRequest request) {
        Post post = postRepository.findById(Objects.requireNonNull(request.getPostId()))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", request.getPostId()));

        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new BadRequestException("Cannot comment on a post that is not published");
        }

        User user = userRepository.findById(Objects.requireNonNull(request.getUserId()))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        if (user.getStatus() == AccountStatus.BANNED) {
            throw new ForbiddenException("User is banned and cannot comment");
        }

        if (user.getVerifyStatus() == UserStatus.DELETED) {
            throw new ForbiddenException("User account has been deleted");
        }

        Comment comment = new Comment();
        comment.setContent(request.getContent().trim());
        comment.setPost(post);
        comment.setUser(user);

        if (request.getParentId() != null) {
            Comment parentComment = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.getParentId()));

            if (!parentComment.getPost().getPostId().equals(post.getPostId())) {
                throw new BadRequestException("Parent comment does not belong to the same post");
            }

            if (parentComment.getParent() != null) {
                throw new BadRequestException("Cannot reply to a reply. Only one level of nesting is allowed");
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
                .stream()
                .map(CommentResponse::new)
                .collect(Collectors.toList());
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
        return commentRepository.findByUserUserId(userId, pageable)
                .map(CommentResponse::new);
    }

    public CommentResponse updateComment(UUID commentId, UUID userId, UpdateCommentRequest request) {
        Comment comment = commentRepository.findById(Objects.requireNonNull(commentId))
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own comments");
        }

        comment.setContent(request.getContent().trim());
        Comment updatedComment = commentRepository.save(comment);
        return new CommentResponse(updatedComment);
    }

    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(Objects.requireNonNull(commentId))
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUser().getUserId().equals(userId)) {
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
