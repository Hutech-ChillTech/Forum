package com.forum.it.repositories;

import com.forum.it.entities.post.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, UUID> {
    Optional<PostLike> findByUserUserIdAndPostPostId(UUID userId, UUID postId);
    long countByPostPostId(UUID postId);
    boolean existsByUserUserIdAndPostPostId(UUID userId, UUID postId);
}
