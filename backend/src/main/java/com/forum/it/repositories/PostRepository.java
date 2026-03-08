package com.forum.it.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import com.forum.it.entities.post.Post;
import com.forum.it.entities.post.PostStatus;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    @EntityGraph(attributePaths = { "user", "category" })
    List<Post> findAllByStatus(PostStatus status, Pageable pageable);

    // @EntityGraph(attributePaths = { "user" })
    // List<Post> findAllByStatusAndCategory(PostStatus status, UUID categoryId,
    // Pageable pageable);

    @Query("SELECT p FROM Post p WHERE " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // @Modifying
    // @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id =
    // :postId")
    // void incrementViewCount(@Param("postId") UUID postId);

    @Modifying
    @Query("UPDATE Post p SET p.like_count = p.like_count + 1 WHERE p.postId = :postId")
    void incrementLikeCount(@Param("postId") UUID postId);

    boolean existsByPostIdAndUserUserId(UUID postId, UUID userId);

    Optional<Post> findByPostIdAndStatus(UUID id, PostStatus status);
}
