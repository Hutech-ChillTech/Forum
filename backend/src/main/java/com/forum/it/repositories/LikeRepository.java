package com.forum.it.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.post.Like;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {
    Optional<Like> findByPostPostIdAndUserUserId(UUID postId, UUID userId);

    Page<Like> findByPostPostId(UUID postId, Pageable pageable);

    Page<Like> findByUserUserId(UUID userId, Pageable pageable);

    long countByPostPostId(UUID postId);

    boolean existsByPostPostIdAndUserUserId(UUID postId, UUID userId);

    void deleteByPostPostId(UUID postId);
}
