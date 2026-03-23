package com.forum.it.dtos.response;

import java.util.Set;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";
    private boolean authenticated;
    private Set<String> permissions;
    private long issuedAt;
    private long expiredAt;
}
