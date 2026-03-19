package com.forum.it.services;

import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.PostLike;
import com.forum.it.entities.user.User;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.PostLikeRepository;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * Toggles a like on a post.
     * Uses a try-catch on DataIntegrityViolationException to handle race conditions 
     * where multiple users/requests attempt to like the same post simultaneously.
     */
    @Transactional
    public Map<String, Object> toggleLike(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        var existingLike = postLikeRepository.findByUserUserIdAndPostPostId(userId, postId);
        boolean isNowLiked;

        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            isNowLiked = false;
        } else {
            try {
                PostLike newLike = new PostLike();
                newLike.setUser(user);
                newLike.setPost(post);
                postLikeRepository.saveAndFlush(newLike);
                post.setLikeCount(post.getLikeCount() + 1);
                isNowLiked = true;
            } catch (DataIntegrityViolationException e) {
                // If a concurrent request already inserted the like, we just ignore the error
                isNowLiked = true;
            }
        }
        postRepository.save(post);

        return Map.of(
            "liked", isNowLiked,
            "likeCount", (long) post.getLikeCount()
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLikeInfo(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        boolean isLiked = userId != null && postLikeRepository.existsByUserUserIdAndPostPostId(userId, postId);
        
        return Map.of(
            "liked", isLiked,
            "likeCount", (long) post.getLikeCount()
        );
    }
}
