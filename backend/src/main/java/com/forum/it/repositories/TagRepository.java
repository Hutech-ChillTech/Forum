package com.forum.it.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.tag.Tag;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findByName(String name);

    boolean existsByName(String name);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Tag t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    java.util.List<com.forum.it.entities.tag.Tag> searchTags(
            @org.springframework.data.repository.query.Param("keyword") String keyword);
}
