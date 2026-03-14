package com.forum.it.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;

import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.dtos.response.PostResponse;
import com.forum.it.entities.post.PostStatus;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.dtos.request.PostRequest.CreatePostRequest;
import com.forum.it.dtos.request.PostRequest.UpdatePostRequest;
import com.forum.it.entities.post.Post;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostService {
    @Autowired
    PostRepository postRepository;
    @Autowired
    UserRepository userRepository;

    @Transactional
    public List<PostResponse> getAllPost() {
        try {
            return postRepository.findAll()
                    .stream()
                    .map(post -> new PostResponse(post))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Transactional
    public PostResponse getPostById(UUID postId) {
        try {
            return postRepository.findById(postId)
                    .map(post -> new PostResponse(post))
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional
    public PostResponse create(CreatePostRequest createPostRequest, UUID userId) {
        if (userId == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        try {
            Post post = new Post();
            post.setTitle(createPostRequest.getTitle());
            post.setContent(createPostRequest.getContent());
            post.setImageURL(createPostRequest.getImageURL());
            post.setStatus(PostStatus.PENDING);
            post.setUser(userRepository.findByUserId(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
            return new PostResponse(postRepository.save(post));
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional
    public PostResponse update(UpdatePostRequest updatePostRequest, UUID postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            post.setTitle(updatePostRequest.getTitle());
            post.setContent(updatePostRequest.getContent());
            post.setImageURL(updatePostRequest.getImageURL());
            post.setStatus(updatePostRequest.getStatus());
            return new PostResponse(postRepository.save(post));
        } catch (AppException e) {
            throw e;
        }
    }

    @Transactional
    public void delete(UUID postId) {
        try {
            if (postRepository.findById(postId).isEmpty()) {
                throw new AppException(ErrorCode.NOT_FOUND);
            }
            postRepository.deleteById(postId);
        } catch (AppException e) {
            throw e;
        }
    }
}
