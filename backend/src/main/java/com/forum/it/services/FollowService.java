package com.forum.it.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.forum.it.dtos.response.FollowResponse;
import com.forum.it.dtos.response.FollowStatusResponse;
import com.forum.it.dtos.response.NotificationResponse;
import com.forum.it.entities.system.Notification;
import com.forum.it.entities.system.NotificationStatus;
import com.forum.it.entities.system.NotificationType;
import com.forum.it.entities.user.Follow;
import com.forum.it.entities.user.User;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.exceptions.ResourceNotFoundException;
import com.forum.it.repositories.FollowRepository;
import com.forum.it.repositories.NotificationRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.utils.SecurityContextHelper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository            followRepository;
    private final UserRepository              userRepository;
    private final NotificationRepository      notificationRepository;
    private final SecurityContextHelper       securityContextHelper;
    private final SimpMessagingTemplate       messagingTemplate;
    private final PlatformTransactionManager  transactionManager;

    // ── Follow / Unfollow ────────────────────────────────────────────────────

    /**
     * Current user follow targetUserId.
     * Gửi notification cho người được follow (trong transaction riêng, sau khi follow commit).
     */
    @Transactional
    public FollowResponse follow(UUID targetUserId) {
        UUID currentUserId = securityContextHelper.getCurrentUserId();

        if (currentUserId.equals(targetUserId)) {
            throw new AppException(ErrorCode.FOLLOW_SELF);
        }
        if (followRepository.existsByFollowerUserIdAndFollowingUserId(currentUserId, targetUserId)) {
            throw new AppException(ErrorCode.ALREADY_FOLLOWING);
        }

        User follower  = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        User following = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);

        Follow saved;
        try {
            saved = followRepository.saveAndFlush(follow);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.ALREADY_FOLLOWING);
        }

        // Notification is created in a SEPARATE transaction AFTER the follow commits.
        // This ensures: (1) the follow is always persisted even if notification fails,
        // (2) the notification is visible in DB before the WebSocket push reaches the client.
        final String followerName = follower.getUserName();
        final UUID   followerId   = follower.getUserId();
        final UUID   followingId  = following.getUserId();

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    TransactionTemplate tx = new TransactionTemplate(transactionManager);
                    NotificationResponse wsPayload = tx.execute(status -> {
                        User target = userRepository.getReferenceById(followingId);
                        Notification notification = new Notification();
                        notification.setUser(target);
                        notification.setType(NotificationType.FOLLOW);
                        notification.setStatus(NotificationStatus.UNREAD);
                        notification.setMessage(followerName + " đã theo dõi bạn");
                        notification.setActorId(followerId);
                        Notification savedNotif = notificationRepository.save(notification);
                        return new NotificationResponse(savedNotif);
                    });
                    if (wsPayload != null) {
                        messagingTemplate.convertAndSendToUser(
                                followingId.toString(), "/queue/notifications", wsPayload);
                    }
                } catch (Exception e) {
                    log.warn("Failed to create follow notification for user {}: {}",
                            followingId, e.getMessage());
                }
            }
        });

        return new FollowResponse(saved, false);
    }

    /**
     * Current user unfollow targetUserId.
     */
    public void unfollow(UUID targetUserId) {
        UUID currentUserId = securityContextHelper.getCurrentUserId();
        Follow follow = followRepository
                .findByFollowerUserIdAndFollowingUserId(currentUserId, targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.FOLLOW_NOT_FOUND));
        followRepository.delete(follow);
    }

    // ── Query ────────────────────────────────────────────────────────────────

    /**
     * Trạng thái follow giữa current user và targetUserId.
     */
    @Transactional(readOnly = true)
    public FollowStatusResponse getFollowStatus(UUID targetUserId) {
        UUID currentUserId = securityContextHelper.getCurrentUserId();
        boolean isFollowing  = followRepository.existsByFollowerUserIdAndFollowingUserId(currentUserId, targetUserId);
        boolean isFollowedBy = followRepository.existsByFollowerUserIdAndFollowingUserId(targetUserId, currentUserId);
        return new FollowStatusResponse(isFollowing, isFollowedBy, isFollowing && isFollowedBy);
    }

    /**
     * Kiểm tra hai user có mutual follow nhau không (dùng nội bộ).
     */
    @Transactional(readOnly = true)
    public boolean isMutualFollow(UUID userA, UUID userB) {
        return followRepository.existsByFollowerUserIdAndFollowingUserId(userA, userB)
            && followRepository.existsByFollowerUserIdAndFollowingUserId(userB, userA);
    }

    /** Danh sách người đang follow userId */
    @Transactional(readOnly = true)
    public Page<FollowResponse> getFollowers(UUID userId, Pageable pageable) {
        return followRepository.findByFollowingUserId(userId, pageable)
                .map(f -> new FollowResponse(f, true));
    }

    /** Danh sách userId đang follow */
    @Transactional(readOnly = true)
    public Page<FollowResponse> getFollowing(UUID userId, Pageable pageable) {
        return followRepository.findByFollowerUserId(userId, pageable)
                .map(f -> new FollowResponse(f, false));
    }

    /** Danh sách mutual follow (bạn bè) của userId */
    @Transactional(readOnly = true)
    public Page<FollowResponse> getFriends(UUID userId, Pageable pageable) {
        return followRepository.findMutualFollows(userId, pageable)
                .map(FollowResponse::new);
    }

    /** Số lượng followers, following, friends */
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getFollowStats(UUID userId) {
        long followers = followRepository.countByFollowingUserId(userId);
        long following = followRepository.countByFollowerUserId(userId);
        long friends   = followRepository.countMutualFollows(userId);
        return java.util.Map.of("followers", followers, "following", following, "friends", friends);
    }
}
