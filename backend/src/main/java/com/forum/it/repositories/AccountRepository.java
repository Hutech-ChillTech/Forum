package com.forum.it.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.forum.it.entities.user.Account;

import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    boolean existsByEmail(String email);

    Account findByEmail(String email);

    Account findByUser_UserId(java.util.UUID userId);
}
