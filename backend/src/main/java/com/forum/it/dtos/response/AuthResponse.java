package com.forum.it.dtos.response;

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
    private long issuedAt;
    private long expiredAt;
}
