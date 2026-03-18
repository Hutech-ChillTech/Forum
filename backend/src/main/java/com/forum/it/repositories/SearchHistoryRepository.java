package com.forum.it.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.system.SearchHistory;
import com.forum.it.entities.user.User;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, UUID> {
    List<SearchHistory> findByUserOrderBySearchedAtDesc(User user, Pageable pageable);

    Optional<SearchHistory> findByUserAndKeyword(User user, String keyword);

    @Modifying
    void deleteByUser(User user);

    @Modifying
    @Query("DELETE FROM SearchHistory sh WHERE sh.user = :user AND sh.keyword = :keyword")
    void deleteByUserAndKeyword(@Param("user") User user, @Param("keyword") String keyword);
}
