package com.forum.it.repositories.interfaces;

import com.forum.it.entities.user.User;
import jakarta.persistence.Id;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@NoRepositoryBean
public interface BaseRepository<T, Id> extends JpaRepository<T, Id> {
    void findByUUID(T t);

}
