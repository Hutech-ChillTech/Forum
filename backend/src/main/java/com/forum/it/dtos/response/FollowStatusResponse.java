package com.forum.it.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Trạng thái follow giữa current user và một user khác.
 *
 * @JsonProperty buộc Jackson dùng đúng tên "isFollowing" thay vì "following"
 * (Lombok @Getter trên boolean isXxx sinh ra getter isXxx(), Jackson strip "is"
 *  → serialize thành "following"). Annotation này ghi đè hành vi đó.
 */
@Getter
@AllArgsConstructor
public class FollowStatusResponse {
    /** Current user → target: tôi đang follow họ không? */
    @JsonProperty("isFollowing")
    private final boolean isFollowing;

    /** Target → current user: họ đang follow tôi không? */
    @JsonProperty("isFollowedBy")
    private final boolean isFollowedBy;

    /** Cả hai follow nhau → mutual follow (bạn bè) */
    @JsonProperty("isMutual")
    private final boolean isMutual;
}
