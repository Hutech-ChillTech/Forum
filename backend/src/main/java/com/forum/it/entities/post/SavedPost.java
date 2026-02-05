package com.forum.it.entities.post;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.forum.it.entities.user.User;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "saved_posts", uniqueConstraints = {@UniqueConstraint(columnNames = {"userId", "postId"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"user", "post"})
public class SavedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID savedPostId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postId", nullable = false)
    private Post post;

    @CreationTimestamp
    private LocalDateTime createdAt;
}