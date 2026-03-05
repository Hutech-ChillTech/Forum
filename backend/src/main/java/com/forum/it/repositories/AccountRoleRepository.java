package com.forum.it.repositories;

import com.forum.it.entities.user.AccountRole;
import com.forum.it.repositories.interfaces.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountRoleRepository extends BaseRepository<AccountRole, UUID> {
    List<AccountRole> findByAccount_AccountId(UUID accountId);
}
