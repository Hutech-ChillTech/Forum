package com.forum.it.dtos.response;

import java.util.UUID;

import com.forum.it.entities.user.User;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Tóm tắt một conversation trong sidebar chat.
 * Trả về danh sách user mà current user đã có cuộc trò chuyện NORMAL.
 */
@Getter
@AllArgsConstructor
public class ConversationSummaryResponse {
    private final UUID    userId;
    private final String  userName;
    private final String  fullName;
    private final String  avatarURL;
    private final boolean online;

    public ConversationSummaryResponse(User user, boolean online) {
        this.userId    = user.getUserId();
        this.userName  = user.getUserName();
        this.fullName  = user.getFullName();
        this.avatarURL = user.getAvatarURL();
        this.online    = online;
    }
}
