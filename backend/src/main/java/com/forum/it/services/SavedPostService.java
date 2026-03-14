package com.forum.it.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.response.SavedPostResponse;
import com.forum.it.entities.post.SavedPost;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.SavedPostRepository;
import com.forum.it.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class SavedPostService {

    private final SavedPostRepository savedPostRepository;
    private final UserRepository      userRepository;
    private final PostRepository      postRepository;

    public void bookmarkPost(UUID userId, UUID postId) {
        if (savedPostRepository.existsByUserUserIdAndPostPostId(userId, postId)) {
            throw new AppException(ErrorCode.BOOKMARK_ALREADY_EXISTS);
        }

        var user = userRepository.getReferenceById(userId);
        var post = postRepository.getReferenceById(postId);

        SavedPost newBookmark = new SavedPost();
        newBookmark.setUser(user);
        newBookmark.setPost(post);
        savedPostRepository.save(newBookmark);
    }

    public void unbookmarkPost(UUID userId, UUID postId) {
        if (!savedPostRepository.existsByUserUserIdAndPostPostId(userId, postId)) {
            throw new AppException(ErrorCode.BOOKMARK_NOT_FOUND);
        }
        savedPostRepository.deleteByUserUserIdAndPostPostId(userId, postId);
    }

    @Transactional(readOnly = true)
    public Page<SavedPostResponse> getMySavedPosts(UUID userId, Pageable pageable) {
        Page<SavedPost> savedPosts = savedPostRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable);
        return savedPosts.map(savedPost -> SavedPostResponse.builder()
                .postId(savedPost.getPost().getPostId())
                .savedAt(savedPost.getCreatedAt().atStartOfDay())
                .build());
    }
}

