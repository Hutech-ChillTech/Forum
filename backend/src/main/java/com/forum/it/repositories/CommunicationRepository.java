package com.forum.it.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.system.Communication;

@Repository
public interface CommunicationRepository extends JpaRepository<Communication, UUID> {

    /**
     * Returns all messages between two users (conversation), ordered newest first.
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

    /**
     * Returns all messages sent TO a given user, ordered newest first.
     */
    Page<Communication> findByReceiverUserIdOrderByCreatedAtDesc(UUID receiverId, Pageable pageable);

    /**
     * Returns all messages sent BY a given user, ordered newest first.
     */
    Page<Communication> findBySenderUserIdOrderByCreatedAtDesc(UUID senderId, Pageable pageable);
}
