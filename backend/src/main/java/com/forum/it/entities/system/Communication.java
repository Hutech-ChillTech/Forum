package com.forum.it.entities.system;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.forum.it.entities.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "communications",
    indexes = {
        @Index(name = "idx_comm_sender",   columnList = "senderId"),
        @Index(name = "idx_comm_receiver", columnList = "receiverId"),
        @Index(name = "idx_comm_status",   columnList = "status")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "sender", "receiver" })
public class Communication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID communicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "senderId", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiverId", nullable = false)
    private User receiver;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * NORMAL  → tin nhắn giữa hai người mutual follow (hiển thị inbox chính).
     * PENDING → người gửi chưa mutual follow với người nhận (nằm trong Message Requests).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageStatus status = MessageStatus.NORMAL;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
