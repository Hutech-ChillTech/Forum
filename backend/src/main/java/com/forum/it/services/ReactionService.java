package com.forum.it.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.ReactionRequest;
import com.forum.it.dtos.response.ReactionResponse;
import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.Reaction;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.ReactionRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository  reactionRepository;
    private final PostRepository      postRepository;
    private final UserRepository      userRepository;
    private final SecurityContextHelper securityContextHelper;

    /**
     * React to a post. If the user already reacted, update the reaction type.
     */
    public ReactionResponse react(UUID postId, ReactionRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        UUID userId = securityContextHelper.getCurrentUserId();
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Reaction reaction = reactionRepository.findByUserUserIdAndPostPostId(userId, postId)
                .orElseGet(() -> {
                    Reaction r = new Reaction();
                    r.setUser(user);
                    r.setPost(post);
                    return r;
                });

        reaction.setReact(request.getReact());
        return new ReactionResponse(reactionRepository.save(reaction));
    }

    /**
     * Remove a reaction from a post.
     */
    public void removeReaction(UUID postId) {
        UUID userId = securityContextHelper.getCurrentUserId();

        if (!reactionRepository.existsByUserUserIdAndPostPostId(userId, postId)) {
            throw new AppException(ErrorCode.REACTION_NOT_FOUND);
        }

        reactionRepository.deleteByUserUserIdAndPostPostId(userId, postId);
    }

    @Transactional(readOnly = true)
    public Page<ReactionResponse> getReactionsByPost(UUID postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }
        return reactionRepository.findByPostPostId(postId, pageable)
                .map(ReactionResponse::new);
    }

    @Transactional(readOnly = true)
    public long countReactionsByPost(UUID postId) {
        return reactionRepository.countByPostPostId(postId);
    }
}
