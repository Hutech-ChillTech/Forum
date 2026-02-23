package com.forum.it.entities.system;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import com.forum.it.entities.user.User;

@Entity
@Table(name = "moderation_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModerationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID moderationLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adminId", nullable = false)
    private User admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "targetUserId", nullable = false)
    private User targetUser;

    @Column(nullable = false, length = 255)
    private String action;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    private LocalDate createdAt;
}