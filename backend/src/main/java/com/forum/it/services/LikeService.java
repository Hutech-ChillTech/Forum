package com.forum.it.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.response.LikeResponse;
import com.forum.it.entities.post.Like;
import com.forum.it.entities.post.Post;
import com.forum.it.entities.user.User;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.LikeRepository;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SecurityContextHelper securityContextHelper;

    public LikeResponse toggleLike(UUID postId) {
        if (postId == null) throw new IllegalArgumentException("Post ID cannot be null");
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        UUID userId = securityContextHelper.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return likeRepository.findByPostPostIdAndUserUserId(postId, userId)
                .map(like -> {
                    likeRepository.delete(like);
                    post.setCountLike(Math.max(0, post.getCountLike() - 1));
                    postRepository.save(post);
                    // Return empty response with isLiked: false
                    return new LikeResponse(postId, userId, false);
                })
                .orElseGet(() -> {
                    Like like = new Like();
                    like.setPost(post);
                    like.setUser(user);
                    Like savedLike = likeRepository.save(like);
                    
                    post.setCountLike(post.getCountLike() + 1);
                    postRepository.save(post);
                    
                    return new LikeResponse(savedLike);
                });
    }

    @Transactional(readOnly = true)
    public boolean isLikedByCurrentUser(UUID postId) {
        try {
            UUID userId = securityContextHelper.getCurrentUserId();
            return likeRepository.existsByPostPostIdAndUserUserId(postId, userId);
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public Page<LikeResponse> getLikesByPost(UUID postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }
        return likeRepository.findByPostPostId(postId, pageable).map(LikeResponse::new);
    }

    @Transactional(readOnly = true)
    public long countLikesByPost(UUID postId) {
        return likeRepository.countByPostPostId(postId);
    }
}
