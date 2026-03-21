package com.forum.it.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.post.Reaction;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, UUID> {

    Optional<Reaction> findByUserUserIdAndPostPostId(UUID userId, UUID postId);

    boolean existsByUserUserIdAndPostPostId(UUID userId, UUID postId);

    Page<Reaction> findByPostPostId(UUID postId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Reaction r WHERE r.post.postId = :postId")
    long countByPostPostId(@Param("postId") UUID postId);

    @Modifying
    @Query("DELETE FROM Reaction r WHERE r.user.userId = :userId AND r.post.postId = :postId")
    void deleteByUserUserIdAndPostPostId(@Param("userId") UUID userId, @Param("postId") UUID postId);

    void deleteByPostPostId(UUID postId);
}
