package com.forum.it.repositories;

import com.forum.it.entities.user.AccountRole;
import com.forum.it.repositories.interfaces.BaseRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountRoleRepository extends BaseRepository<AccountRole, UUID> {
    List<AccountRole> findByAccount_AccountId(UUID accountId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AccountRole ar WHERE ar.account.accountId = :accountId")
    void deleteByAccount_AccountId(UUID accountId);
}
