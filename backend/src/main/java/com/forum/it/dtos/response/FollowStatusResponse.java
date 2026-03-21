package com.forum.it.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Trạng thái follow giữa current user và một user khác.
 */
@Getter
@AllArgsConstructor
public class FollowStatusResponse {
    /** Current user → target: tôi đang follow họ không? */
    private final boolean isFollowing;

    /** Target → current user: họ đang follow tôi không? */
    private final boolean isFollowedBy;

    /** Cả hai follow nhau → mutual follow (bạn bè) */
    private final boolean isMutual;
}
