package com.forum.it.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.tag.PostTag;

@Repository
public interface PostTagRepository extends JpaRepository<PostTag, UUID> {

    List<PostTag> findByPostPostId(UUID postId);

    List<PostTag> findByTagTagId(UUID tagId);

    @Query("SELECT pt.tag.name FROM PostTag pt WHERE pt.post.postId = :postId")
    List<String> findTagNamesByPostId(@Param("postId") UUID postId);

    void deleteByPostPostId(UUID postId);

    boolean existsByPostPostIdAndTagTagId(UUID postId, UUID tagId);
}
