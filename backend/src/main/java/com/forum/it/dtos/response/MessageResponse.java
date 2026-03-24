package com.forum.it.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.forum.it.entities.system.Communication;
import com.forum.it.entities.system.MessageStatus;

import lombok.Getter;

@Getter
public class MessageResponse {
    private final UUID          communicationId;
    private final UUID          senderId;
    private final String        senderName;
    private final String        senderAvatarURL;
    private final UUID          receiverId;
    private final String        receiverName;
    private final String        message;
    private final MessageStatus  status;
    private final LocalDateTime   createdAt;

    public MessageResponse(Communication c) {
        this.communicationId = c.getCommunicationId();
        this.senderId        = c.getSender().getUserId();
        this.senderName      = c.getSender().getUserName();
        this.senderAvatarURL = c.getSender().getAvatarURL();
        this.receiverId      = c.getReceiver().getUserId();
        this.receiverName    = c.getReceiver().getUserName();
        this.message         = c.getMessage();
        this.status          = c.getStatus();
        this.createdAt       = c.getCreatedAt();
    }
}
