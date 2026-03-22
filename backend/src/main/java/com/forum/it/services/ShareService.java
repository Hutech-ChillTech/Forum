package com.forum.it.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.ShareRequest;
import com.forum.it.dtos.response.ShareResponse;
import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.Share;
import com.forum.it.entities.user.User;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.ShareRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ShareService {

    private final ShareRepository     shareRepository;
    private final PostRepository      postRepository;
    private final UserRepository      userRepository;
    private final SecurityContextHelper securityContextHelper;

    public ShareResponse sharePost(UUID postId, ShareRequest request) {
        if (postId == null) throw new IllegalArgumentException("Post ID cannot be null");
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        UUID userId = securityContextHelper.getCurrentUserId();
        if (userId == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Share share = new Share();
        share.setPost(post);
        share.setUser(user);
        share.setPlatform(request.getPlatform());

        try {
            return new ShareResponse(shareRepository.save(share));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // If it's a duplicate share, we just return a success response with the data
            // we have, since the goal (copying link) is achieved.
            return new ShareResponse(share);
        }
    }

    @Transactional(readOnly = true)
    public Page<ShareResponse> getSharesByPost(UUID postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }
        return shareRepository.findByPostPostId(postId, pageable).map(ShareResponse::new);
    }

    @Transactional(readOnly = true)
    public Page<ShareResponse> getMyShares(Pageable pageable) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return shareRepository.findByUserUserId(userId, pageable).map(ShareResponse::new);
    }

    @Transactional(readOnly = true)
    public long countSharesByPost(UUID postId) {
        return shareRepository.countByPostPostId(postId);
    }
}
