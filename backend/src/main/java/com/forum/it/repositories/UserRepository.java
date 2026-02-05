package com.forum.it.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.account.AccountStatus;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

        Optional<User> findByEmail(String email);

        Optional<User> findByUserName(String userName);

        List<User> findByStatus(AccountStatus status);

        List<User> findByVerifyStatus(UserStatus verifyStatus);

        List<User> findByStatusAndVerifyStatus(AccountStatus status, UserStatus verifyStatus);

        boolean existsByEmail(String email);

        boolean existsByUserName(String userName);

        List<User> findByUserNameContaining(String keyword);

        List<User> findByEmailContaining(String keyword);

        @Query("SELECT u FROM User u WHERE " +
                        "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
        List<User> searchUsers(@Param("keyword") String keyword);

        @Query("SELECT u FROM User u WHERE u.verifyStatus = 'ACTIVE' AND u.status != 'BANNED'")
        Page<User> findActiveUsers(Pageable pageable);

        @Query(value = "SELECT COUNT(*) FROM users WHERE status = :status", nativeQuery = true)
        long countByStatus(@Param("status") String status);

        @Query("SELECT u FROM User u WHERE u.createdAt BETWEEN :startDate AND :endDate")
        List<User> findUsersByDateRange(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        void deleteByEmail(String email);

        void deleteByStatus(AccountStatus status);
}
