package com.forum.it.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.system.Notification;
import com.forum.it.entities.system.NotificationStatus;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByUserUserIdAndStatus(UUID userId, NotificationStatus status);

    @Modifying
    @Query("UPDATE Notification n SET n.status = :status WHERE n.user.userId = :userId")
    void markAllAsRead(@Param("userId") UUID userId, @Param("status") NotificationStatus status);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.userId = :userId")
    void deleteAllByUserId(@Param("userId") UUID userId);

    void deleteByPostPostId(UUID postId);
}
