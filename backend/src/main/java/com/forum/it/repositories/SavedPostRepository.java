package com.forum.it.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.post.SavedPost;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, UUID> {

    Page<SavedPost> findByUserUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    boolean existsByUserUserIdAndPostPostId(UUID userId, UUID postId);

    void deleteByUserUserIdAndPostPostId(UUID userId, UUID postId);
}
