package com.forum.it.entities.user;

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Quan hệ follow giữa hai người dùng.
 *
 * - follower: người đi follow
 * - following: người được follow
 * - Nếu A follow B VÀ B follow A → họ là mutual follow (bạn bè)
 */
@Entity
@Table(
    name = "follows",
    indexes = {
        @Index(name = "idx_follow_follower",  columnList = "follower_id"),
        @Index(name = "idx_follow_following", columnList = "following_id")
    },
    uniqueConstraints = @UniqueConstraint(
        name  = "uq_follow_pair",
        columnNames = {"follower_id", "following_id"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID followId;

    /** Người đi follow */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    /** Người được follow */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    @CreationTimestamp
    private LocalDate createdAt;
}
