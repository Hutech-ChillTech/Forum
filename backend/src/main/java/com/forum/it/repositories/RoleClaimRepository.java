package com.forum.it.repositories;

import com.forum.it.entities.user.RoleClaim;
import com.forum.it.repositories.interfaces.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoleClaimRepository extends BaseRepository<RoleClaim, UUID> {
    List<RoleClaim> findByRole_RoleId(UUID roleId);
}
