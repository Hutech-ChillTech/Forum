package com.forum.it.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.response.PostResponse;
import com.forum.it.dtos.response.SavedPostResponse;
import com.forum.it.entities.post.SavedPost;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.PostTagRepository;
import com.forum.it.repositories.SavedPostRepository;
import com.forum.it.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class SavedPostService {

    private final SavedPostRepository savedPostRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostTagRepository postTagRepository;

    public void bookmarkPost(UUID userId, UUID postId) {
        var post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (post.getUser().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.BOOKMARK_CANNOT_SAVE_OWN_POST);
        }

        if (savedPostRepository.existsByUserUserIdAndPostPostId(userId, postId)) {
            return; // Duplicate bookmark request, just ignore
        }

        var user = userRepository.getReferenceById(userId);

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
        return savedPosts.map(savedPost -> {
            var post = savedPost.getPost();
            var tagNames = postTagRepository.findTagNamesByPostId(post.getPostId());
            var postResponse = new PostResponse(post, tagNames);
            postResponse.setIsSaved(true);

            return SavedPostResponse.builder()
                    .postId(post.getPostId())
                    .savedAt(savedPost.getCreatedAt().atStartOfDay())
                    .post(postResponse)
                    .build();
        });
    }
}
