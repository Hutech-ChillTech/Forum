package com.forum.it.dtos.request;

import java.io.Serializable;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest implements Serializable {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
    private String status;
}
