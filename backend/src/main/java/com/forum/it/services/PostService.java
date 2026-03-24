package com.forum.it.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.CreatePostRequest;
import com.forum.it.dtos.request.UpdatePostRequest;
import com.forum.it.dtos.response.PostResponse;
import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.PostStatus;
import com.forum.it.entities.system.Notification;
import com.forum.it.entities.system.NotificationStatus;
import com.forum.it.entities.system.NotificationType;
import com.forum.it.entities.tag.PostTag;
import com.forum.it.entities.tag.Tag;
import com.forum.it.entities.user.AccountStatus;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.exceptions.ForbiddenException;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.CommentRepository;
import com.forum.it.repositories.FollowRepository;
import com.forum.it.repositories.NotificationRepository;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.PostTagRepository;
import com.forum.it.repositories.ReactionRepository;
import com.forum.it.repositories.SavedPostRepository;
import com.forum.it.repositories.ShareRepository;
import com.forum.it.repositories.TagRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final PostTagRepository postTagRepository;
    private final CommentRepository commentRepository;
    private final ReactionRepository reactionRepository;
    private final SavedPostRepository savedPostRepository;
    private final ShareRepository shareRepository;
    private final NotificationRepository notificationRepository;
    private final FollowRepository followRepository;
    private final SecurityContextHelper securityContextHelper;

    /**
     * userId is resolved from the JWT — NOT from the request body.
     */
    public PostResponse createPost(CreatePostRequest request) {
        UUID userId = securityContextHelper.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() == AccountStatus.BANNED) {
            throw new AppException(ErrorCode.USER_BANNED);
        }

        if (user.getVerifyStatus() == UserStatus.DELETED) {
            throw new AppException(ErrorCode.USER_DELETED);
        }

        if (postRepository.existsByTitleAndUserUserId(request.getTitle(), user.getUserId())) {
            throw new AppException(ErrorCode.POST_DUPLICATE_TITLE);
        }

        Post post = new Post();
        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent().trim());
        post.setImageURL(request.getImageURL());
        post.setStatus(PostStatus.PUBLISHED);
        post.setUser(user);

        Post savedPost = postRepository.save(post);
        List<String> tagNames = handleTags(savedPost, request.getTagNames());
        return new PostResponse(savedPost, tagNames);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPublishedPosts(Pageable pageable) {
        Page<PostResponse> page = postRepository.findPublishedPosts(pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
        enrichSavedStatus(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getFollowingPosts(Pageable pageable) {
        UUID currentUserId = securityContextHelper.getCurrentUserId();
        List<UUID> followingIds = followRepository.findByFollowerUserId(currentUserId, Pageable.unpaged())
                .map(follow -> follow.getFollowing().getUserId())
                .getContent();
        if (followingIds.isEmpty()) {
            return Page.empty(pageable);
        }
        Page<PostResponse> page = postRepository.findPublishedPostsByUserIds(followingIds, pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
        enrichSavedStatus(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        Page<PostResponse> page = postRepository.findAll(pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
        enrichSavedStatus(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    // @Cacheable(value = "posts", key = "#postId")
    public PostResponse getPostById(UUID postId) {
        System.out.println("DEBUG: Fetching post by ID: " + postId);
        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> {
                    System.err.println("DEBUG: Post not found in DB: " + postId);
                    return new ResourceNotFoundException("Post", "id", postId);
                });
        System.out.println("DEBUG: Post found: " + post.getTitle());
        return new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId()));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByUserId(UUID userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        Page<PostResponse> page = postRepository.findByUserUserIdAndStatus(userId, PostStatus.PUBLISHED, pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
        enrichSavedStatus(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByStatus(PostStatus status, Pageable pageable) {
        Page<PostResponse> page = postRepository.findByStatus(status, pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
        enrichSavedStatus(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> searchPosts(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        Page<PostResponse> page = postRepository.searchPosts(keyword.trim(), pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
        enrichSavedStatus(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getRecentPosts(int days, Pageable pageable) {
        LocalDate since = LocalDate.now().minusDays(days);
        Page<PostResponse> page = postRepository.findRecentPosts(since, pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
        enrichSavedStatus(page.getContent());
        return page;
    }

    public PostResponse updatePost(UUID postId, UpdatePostRequest request) {
        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        UUID currentUserId = securityContextHelper.getCurrentUserId();
        if (!post.getUser().getUserId().equals(currentUserId)) {
            throw new ForbiddenException("You can only edit your own posts");
        }

        if (post.getStatus() == PostStatus.REJECTED) {
            throw new AppException(ErrorCode.POST_REJECTED);
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            if (!post.getTitle().equals(request.getTitle().trim())
                    && postRepository.existsByTitleAndUserUserId(request.getTitle().trim(), currentUserId)) {
                throw new AppException(ErrorCode.POST_DUPLICATE_TITLE);
            }
            post.setTitle(request.getTitle().trim());
        }

        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            post.setContent(request.getContent().trim());
        }

        if (request.getImageURL() != null) {
            post.setImageURL(request.getImageURL());
        }

        Post updatedPost = postRepository.save(post);

        List<String> tagNames;
        if (request.getTagNames() != null) {
            postTagRepository.deleteByPostPostId(postId);
            tagNames = handleTags(updatedPost, request.getTagNames());
        } else {
            tagNames = postTagRepository.findTagNamesByPostId(postId);
        }

        return new PostResponse(updatedPost, tagNames);
    }

    public PostResponse updatePostStatus(UUID postId, PostStatus status) {
        if (status == PostStatus.REJECTED) {
            deletePostByAdmin(postId);
            return null; // Post is gone
        }

        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        PostStatus oldStatus = post.getStatus();
        post.setStatus(status);
        Post updatedPost = postRepository.save(post);

        // Notify author if post is approved
        if (oldStatus == PostStatus.PENDING && status == PostStatus.PUBLISHED) {
            Notification notification = new Notification();
            notification.setUser(post.getUser());
            notification.setPost(post);
            notification.setType(NotificationType.SYSTEM);
            notification.setMessage("Bài viết của bạn \"" + post.getTitle() + "\" đã được phê duyệt thành công!");
            notification.setStatus(NotificationStatus.UNREAD);
            notificationRepository.save(notification);
        }

        PostResponse response = new PostResponse(updatedPost, postTagRepository.findTagNamesByPostId(postId));
        enrichSavedStatus(Collections.singletonList(response));
        return response;
    }

    public void deletePost(UUID postId) {
        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        UUID currentUserId = securityContextHelper.getCurrentUserId();
        boolean isAdmin = securityContextHelper.isModeratorOrAdmin();
        if (!isAdmin && !post.getUser().getUserId().equals(currentUserId)) {
            throw new ForbiddenException("You can only delete your own posts");
        }

        postTagRepository.deleteByPostPostId(postId);
        commentRepository.deleteByPostPostId(postId);
        reactionRepository.deleteByPostPostId(postId);
        savedPostRepository.deleteByPostPostId(postId);
        shareRepository.deleteByPostPostId(postId);
        notificationRepository.deleteByPostPostId(postId);
        postRepository.delete(post);
    }

    public void deletePostByAdmin(UUID postId) {
        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        postTagRepository.deleteByPostPostId(postId);
        commentRepository.deleteByPostPostId(postId);
        reactionRepository.deleteByPostPostId(postId);
        savedPostRepository.deleteByPostPostId(postId);
        shareRepository.deleteByPostPostId(postId);
        notificationRepository.deleteByPostPostId(postId);
        postRepository.delete(post);
    }

    @Transactional(readOnly = true)
    public long getTotalPosts() {
        return postRepository.count();
    }

    @Transactional(readOnly = true)
    public long countPostsByStatus(PostStatus status) {
        return postRepository.countByStatus(status);
    }

    @Transactional(readOnly = true)
    public long countPostsByUser(UUID userId) {
        return postRepository.countByUserId(userId);
    }

    private void enrichSavedStatus(List<PostResponse> responses) {
        if (responses == null || responses.isEmpty())
            return;
        try {
            UUID userId = securityContextHelper.getCurrentUserId();
            if (userId != null) {
                List<UUID> postIds = responses.stream()
                        .map(PostResponse::getPostId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());

                if (postIds.isEmpty())
                    return;

                Set<UUID> savedPostIds = new java.util.HashSet<>(savedPostRepository.findSavedPostIds(userId, postIds));
                responses.forEach(r -> r.setIsSaved(savedPostIds.contains(r.getPostId())));
            }
        } catch (Exception ignored) {
            // Not authenticated or other error, just leave isSaved as false
        }
    }

    private List<String> handleTags(Post post, List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> processedTagNames = new ArrayList<>();

        for (String tagName : tagNames) {
            String trimmedName = tagName.trim().toLowerCase();
            if (trimmedName.isEmpty() || trimmedName.length() > 100) {
                continue;
            }

            Tag tag = tagRepository.findByName(trimmedName)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(trimmedName);
                        return tagRepository.save(newTag);
                    });

            if (!postTagRepository.existsByPostPostIdAndTagTagId(post.getPostId(), tag.getTagId())) {
                PostTag postTag = new PostTag();
                postTag.setPost(post);
                postTag.setTag(tag);
                postTagRepository.save(postTag);
            }

            processedTagNames.add(trimmedName);
        }

        return processedTagNames;
    }
}
