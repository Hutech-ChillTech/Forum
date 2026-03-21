package com.forum.it.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.user.Follow;
import com.forum.it.entities.user.User;

@Repository
public interface FollowRepository extends JpaRepository<Follow, UUID> {

    Optional<Follow> findByFollowerUserIdAndFollowingUserId(UUID followerId, UUID followingId);

    boolean existsByFollowerUserIdAndFollowingUserId(UUID followerId, UUID followingId);

    /** Ai đang follow userId (danh sách người theo dõi) */
    Page<Follow> findByFollowingUserId(UUID followingId, Pageable pageable);

    long countByFollowingUserId(UUID followingId);

    /** userId đang follow ai (danh sách đang theo dõi) */
    Page<Follow> findByFollowerUserId(UUID followerId, Pageable pageable);

    long countByFollowerUserId(UUID followerId);

    /**
     * Lấy danh sách user mà userId follow VÀ họ cũng follow lại userId (mutual follow = bạn bè).
     */
    @Query("""
            SELECT f.following FROM Follow f
            WHERE f.follower.userId = :userId
              AND EXISTS (
                  SELECT 1 FROM Follow f2
                  WHERE f2.follower.userId = f.following.userId
                    AND f2.following.userId = :userId
              )
            """)
    Page<User> findMutualFollows(@Param("userId") UUID userId, Pageable pageable);

    @Query("""
            SELECT COUNT(f) FROM Follow f
            WHERE f.follower.userId = :userId
              AND EXISTS (
                  SELECT 1 FROM Follow f2
                  WHERE f2.follower.userId = f.following.userId
                    AND f2.following.userId = :userId
              )
            """)
    long countMutualFollows(@Param("userId") UUID userId);
}
