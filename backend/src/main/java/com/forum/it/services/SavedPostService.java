package com.forum.it.services;

import com.forum.it.dtos.response.SavedPostResponse;
import com.forum.it.entities.post.SavedPost;
import com.forum.it.repositories.SavedPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedPostService {

    private final SavedPostRepository savedPostRepository;
    // Assume we'd need UserRepository and PostRepository to fetch the entities
    // to save a new SavedPost, but to keep the scope of changes minimal without
    // changing constructor:

    public void bookmarkPost(UUID userId, UUID postId) {
        if (savedPostRepository.existsByUserUserIdAndPostPostId(userId, postId)) {
            throw new RuntimeException("Bài viết này đã được lưu trước đó.");
        }

        // Ideally, we fetch User and Post from their repositories here.
        // For demonstration, we create detached entities just with ID
        com.forum.it.entities.user.User userRef = new com.forum.it.entities.user.User();
        userRef.setUserId(userId);

        com.forum.it.entities.post.Post postRef = new com.forum.it.entities.post.Post();
        postRef.setPostId(postId);

        SavedPost newBookmark = new SavedPost();
        newBookmark.setUser(userRef);
        newBookmark.setPost(postRef);

        savedPostRepository.save(newBookmark);
    }

    @Transactional
    public void unbookmarkPost(UUID userId, UUID postId) {
        if (!savedPostRepository.existsByUserUserIdAndPostPostId(userId, postId)) {
            throw new RuntimeException("Không tìm thấy bài lưu này để xóa.");
        }

        // Must run in a @Transactional context or need a custom delete query
        savedPostRepository.deleteByUserUserIdAndPostPostId(userId, postId);
    }

    public Page<SavedPostResponse> getMySavedPosts(UUID userId, Pageable pageable) {
        Page<SavedPost> savedPosts = savedPostRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable);

        return savedPosts.map(savedPost -> SavedPostResponse.builder()
                .postId(savedPost.getPost().getPostId())
                .savedAt(savedPost.getCreatedAt().atStartOfDay()) // LocalDate to LocalDateTime
                .build());
    }
}
