package com.forum.it.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.CreatePostRequest;
import com.forum.it.dtos.request.UpdatePostRequest;
import com.forum.it.dtos.response.PostResponse;
import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.PostStatus;
import com.forum.it.entities.tag.PostTag;
import com.forum.it.entities.tag.Tag;
import com.forum.it.entities.user.AccountStatus;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;
import com.forum.it.exceptions.BadRequestException;
import com.forum.it.exceptions.ForbiddenException;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.CommentRepository;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.PostTagRepository;
import com.forum.it.repositories.TagRepository;
import com.forum.it.repositories.UserRepository;

@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final PostTagRepository postTagRepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository,
                       UserRepository userRepository,
                       TagRepository tagRepository,
                       PostTagRepository postTagRepository,
                       CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.postTagRepository = postTagRepository;
        this.commentRepository = commentRepository;
    }

    public PostResponse createPost(CreatePostRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(request.getUserId()))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        if (user.getStatus() == AccountStatus.BANNED) {
            throw new ForbiddenException("User is banned and cannot create posts");
        }

        if (user.getVerifyStatus() == UserStatus.DELETED) {
            throw new ForbiddenException("User account has been deleted");
        }

        if (postRepository.existsByTitleAndUserUserId(request.getTitle(), user.getUserId())) {
            throw new BadRequestException("You already have a post with this title");
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
        return postRepository.findPublishedPosts(pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(UUID postId) {
        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        return new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId()));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByUserId(UUID userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return postRepository.findByUserUserId(userId, pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByStatus(PostStatus status, Pageable pageable) {
        return postRepository.findByStatus(status, pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> searchPosts(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BadRequestException("Search keyword cannot be empty");
        }
        return postRepository.searchPosts(keyword.trim(), pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getRecentPosts(int days, Pageable pageable) {
        LocalDate since = LocalDate.now().minusDays(days);
        return postRepository.findRecentPosts(since, pageable)
                .map(post -> new PostResponse(post, postTagRepository.findTagNamesByPostId(post.getPostId())));
    }

    public PostResponse updatePost(UUID postId, UUID userId, UpdatePostRequest request) {
        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        if (!post.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own posts");
        }

        if (post.getStatus() == PostStatus.REJECTED) {
            throw new BadRequestException("Cannot edit a rejected post");
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            if (!post.getTitle().equals(request.getTitle().trim())
                    && postRepository.existsByTitleAndUserUserId(request.getTitle().trim(), userId)) {
                throw new BadRequestException("You already have a post with this title");
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
        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        post.setStatus(status);
        Post updatedPost = postRepository.save(post);
        return new PostResponse(updatedPost, postTagRepository.findTagNamesByPostId(postId));
    }

    public void deletePost(UUID postId, UUID userId) {
        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        if (!post.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own posts");
        }

        postTagRepository.deleteByPostPostId(postId);
        postRepository.delete(post);
    }

    public void deletePostByAdmin(UUID postId) {
        Post post = postRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        postTagRepository.deleteByPostPostId(postId);
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
