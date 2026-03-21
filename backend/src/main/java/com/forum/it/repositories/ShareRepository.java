package com.forum.it.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.post.Share;

@Repository
public interface ShareRepository extends JpaRepository<Share, UUID> {

    Page<Share> findByPostPostId(UUID postId, Pageable pageable);

    Page<Share> findByUserUserId(UUID userId, Pageable pageable);

    @Query("SELECT COUNT(s) FROM Share s WHERE s.post.postId = :postId")
    long countByPostPostId(@Param("postId") UUID postId);

    void deleteByPostPostId(UUID postId);
}
