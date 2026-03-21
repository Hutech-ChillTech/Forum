package com.forum.it.repositories;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.PostStatus;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    Optional<Post> findByTitle(String title);

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    Page<Post> findByUserUserId(UUID userId, Pageable pageable);

    Page<Post> findByUserUserIdAndStatus(UUID userId, PostStatus status, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' ORDER BY p.createdAt DESC")
    Page<Post> findPublishedPosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Post> searchPosts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.createdAt >= :since ORDER BY p.createdAt DESC")
    Page<Post> findRecentPosts(@Param("since") LocalDate since, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.userId = :userId")
    long countByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.status = :status")
    long countByStatus(@Param("status") PostStatus status);

    boolean existsByTitleAndUserUserId(String title, UUID userId);
}
