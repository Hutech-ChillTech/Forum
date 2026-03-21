package com.forum.it.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.system.ModerationLog;

@Repository
public interface ModerationLogRepository extends JpaRepository<ModerationLog, UUID> {

    Page<ModerationLog> findByAdminUserIdOrderByCreatedAtDesc(UUID adminId, Pageable pageable);

    Page<ModerationLog> findByTargetUserUserIdOrderByCreatedAtDesc(UUID targetUserId, Pageable pageable);
}
