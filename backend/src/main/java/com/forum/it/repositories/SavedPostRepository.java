package com.forum.it.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.post.SavedPost;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, UUID> {

    @Query("SELECT s.post.postId FROM SavedPost s WHERE s.user.userId = :userId AND s.post.postId IN :postIds")
    List<UUID> findSavedPostIds(@Param("userId") UUID userId, @Param("postIds") List<UUID> postIds);

    Page<SavedPost> findByUserUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    boolean existsByUserUserIdAndPostPostId(UUID userId, UUID postId);

    void deleteByUserUserIdAndPostPostId(UUID userId, UUID postId);

    void deleteByPostPostId(UUID postId);
}
