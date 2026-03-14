package com.forum.it.dtos.response;

import java.time.LocalDate;
import java.util.UUID;

import com.forum.it.entities.system.ModerationLog;

import lombok.Getter;

@Getter
public class ModerationLogResponse {
    private final UUID moderationLogId;
    private final UUID adminId;
    private final String adminName;
    private final UUID targetUserId;
    private final String targetUserName;
    private final String action;
    private final String reason;
    private final LocalDate createdAt;

    public ModerationLogResponse(ModerationLog log) {
        this.moderationLogId = log.getModerationLogId();
        this.adminId         = log.getAdmin().getUserId();
        this.adminName       = log.getAdmin().getUserName();
        this.targetUserId    = log.getTargetUser().getUserId();
        this.targetUserName  = log.getTargetUser().getUserName();
        this.action          = log.getAction();
        this.reason          = log.getReason();
        this.createdAt       = log.getCreatedAt();
    }
}
