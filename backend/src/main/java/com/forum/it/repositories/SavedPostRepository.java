package com.forum.it.repositories;

import com.forum.it.entities.post.SavedPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, UUID> {

    Page<SavedPost> findByUserUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    boolean existsByUserUserIdAndPostPostId(UUID userId, UUID postId);

    void deleteByUserUserIdAndPostPostId(UUID userId, UUID postId);

}
