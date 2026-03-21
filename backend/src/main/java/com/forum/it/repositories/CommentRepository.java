package com.forum.it.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.post.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Page<Comment> findByPostPostId(UUID postId, Pageable pageable);

    List<Comment> findByPostPostIdAndParentIsNull(UUID postId);

    Page<Comment> findByPostPostIdAndParentIsNull(UUID postId, Pageable pageable);

    List<Comment> findByParentCommentId(UUID parentId);

    Page<Comment> findByUserUserId(UUID userId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.postId = :postId")
    long countByPostId(@Param("postId") UUID postId);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user.userId = :userId")
    long countByUserId(@Param("userId") UUID userId);

    void deleteByPostPostId(UUID postId);
}
