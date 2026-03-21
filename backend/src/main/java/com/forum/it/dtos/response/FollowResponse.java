package com.forum.it.dtos.response;

import java.time.LocalDate;
import java.util.UUID;

import com.forum.it.entities.user.Follow;
import com.forum.it.entities.user.User;

import lombok.Getter;

/**
 * DTO trả về thông tin follow.
 * Có thể biểu diễn:
 *   - Follower (showFollower=true): người đang follow userId
 *   - Following (showFollower=false): userId đang follow ai
 *   - Friend (constructor User): mutual follow
 */
@Getter
public class FollowResponse {

    private final UUID    followId;
    private final UUID    userId;
    private final String  userName;
    private final String  fullName;
    private final String  avatarURL;
    private final LocalDate followedAt;

    /** Dùng khi lấy từ Follow entity */
    public FollowResponse(Follow follow, boolean showFollower) {
        this.followId   = follow.getFollowId();
        this.followedAt = follow.getCreatedAt();
        User user = showFollower ? follow.getFollower() : follow.getFollowing();
        this.userId    = user.getUserId();
        this.userName  = user.getUserName();
        this.fullName  = user.getFullName();
        this.avatarURL = user.getAvatarURL();
    }

    /** Dùng khi lấy danh sách bạn bè (mutual follow) trực tiếp từ User */
    public FollowResponse(User user) {
        this.followId   = null;
        this.followedAt = null;
        this.userId    = user.getUserId();
        this.userName  = user.getUserName();
        this.fullName  = user.getFullName();
        this.avatarURL = user.getAvatarURL();
    }
}
