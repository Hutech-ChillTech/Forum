package com.forum.it.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.request.RoleRequest;
import com.forum.it.dtos.response.RoleResponse;
import com.forum.it.entities.user.Role;
import com.forum.it.repositories.RoleRepository;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream()
                .map(RoleResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleResponse getByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return new RoleResponse(role);
    }

    @Transactional
    public RoleResponse create(RoleRequest request) {
        if (roleRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        Role role = new Role();
        role.setName(request.getName());
        return new RoleResponse(roleRepository.save(role));
    }

    @Transactional
    public void delete(UUID id) {
        if (!roleRepository.existsById(id)) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        roleRepository.deleteById(id);
    }
}
