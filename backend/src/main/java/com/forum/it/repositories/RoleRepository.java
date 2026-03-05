package com.forum.it.repositories;

import com.forum.it.entities.user.Role;
import com.forum.it.repositories.interfaces.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends BaseRepository<Role, UUID> {
    Optional<Role> findByName(String name);
}
