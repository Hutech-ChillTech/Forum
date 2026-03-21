package com.forum.it.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.system.Communication;
import com.forum.it.entities.system.MessageStatus;
import com.forum.it.entities.user.User;

@Repository
public interface CommunicationRepository extends JpaRepository<Communication, UUID> {

    /**
     * Toàn bộ tin nhắn giữa hai user (cả hai chiều), mới nhất trước.
     * Không lọc theo status – dùng khi mở cửa sổ hội thoại bất kỳ.
     */
    @Query("""
            SELECT c FROM Communication c
            WHERE (c.sender.userId = :userA AND c.receiver.userId = :userB)
               OR (c.sender.userId = :userB AND c.receiver.userId = :userA)
            ORDER BY c.createdAt DESC
            """)
    Page<Communication> findConversation(
            @Param("userA") UUID userA,
            @Param("userB") UUID userB,
            Pageable pageable);

    // ── Normal inbox / sent ──────────────────────────────────────────────────

    /** Tin nhắn NORMAL nhận được bởi userId (inbox chính) */
    Page<Communication> findByReceiverUserIdAndStatusOrderByCreatedAtDesc(
            UUID receiverId, MessageStatus status, Pageable pageable);

    /** Tin nhắn NORMAL đã gửi bởi userId */
    Page<Communication> findBySenderUserIdAndStatusOrderByCreatedAtDesc(
            UUID senderId, MessageStatus status, Pageable pageable);

    // ── Conversation list ────────────────────────────────────────────────────

    /** Các user đã GỬI tin nhắn NORMAL cho userId (để lấy danh sách conversations) */
    @Query("""
            SELECT DISTINCT c.sender FROM Communication c
            WHERE c.receiver.userId = :userId
              AND c.status = :status
            """)
    List<User> findDistinctSendersWithStatus(
            @Param("userId") UUID userId,
            @Param("status") MessageStatus status);

    /** Các user đã NHẬN tin nhắn NORMAL từ userId (để lấy danh sách conversations) */
    @Query("""
            SELECT DISTINCT c.receiver FROM Communication c
            WHERE c.sender.userId = :userId
              AND c.status = :status
            """)
    List<User> findDistinctReceiversWithStatus(
            @Param("userId") UUID userId,
            @Param("status") MessageStatus status);

    // ── Pending message requests ─────────────────────────────────────────────

    /** Danh sách user có tin nhắn PENDING gửi đến userId (Message Requests) */
    @Query("""
            SELECT DISTINCT c.sender FROM Communication c
            WHERE c.receiver.userId = :userId
              AND c.status = :status
            """)
    List<User> findDistinctPendingSenders(
            @Param("userId") UUID userId,
            @Param("status") MessageStatus status);

    /** Tin nhắn PENDING từ senderId tới receiverId (xem trước khi chấp nhận) */
    @Query("""
            SELECT c FROM Communication c
            WHERE c.sender.userId = :senderId
              AND c.receiver.userId = :receiverId
              AND c.status = com.forum.it.entities.system.MessageStatus.PENDING
            ORDER BY c.createdAt ASC
            """)
    List<Communication> findPendingConversation(
            @Param("senderId") UUID senderId,
            @Param("receiverId") UUID receiverId);

    /** Chấp nhận tất cả tin nhắn PENDING từ senderId → receiverId */
    @Modifying
    @Query("""
            UPDATE Communication c
            SET c.status = com.forum.it.entities.system.MessageStatus.NORMAL
            WHERE c.sender.userId = :senderId
              AND c.receiver.userId = :receiverId
              AND c.status = com.forum.it.entities.system.MessageStatus.PENDING
            """)
    int acceptPendingMessages(
            @Param("senderId") UUID senderId,
            @Param("receiverId") UUID receiverId);

    /** Từ chối (xoá) tất cả tin nhắn PENDING từ senderId → receiverId */
    @Modifying
    @Query("""
            DELETE FROM Communication c
            WHERE c.sender.userId = :senderId
              AND c.receiver.userId = :receiverId
              AND c.status = com.forum.it.entities.system.MessageStatus.PENDING
            """)
    void rejectPendingMessages(
            @Param("senderId") UUID senderId,
            @Param("receiverId") UUID receiverId);

    boolean existsBySenderUserIdAndReceiverUserIdAndStatus(
            UUID senderId, UUID receiverId, MessageStatus status);
}

