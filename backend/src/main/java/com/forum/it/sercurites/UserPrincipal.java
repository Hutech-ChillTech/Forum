package com.forum.it.sercurites;

import java.security.Principal;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Lightweight principal stored in the SecurityContext after JWT validation.
 * Carries only the data embedded in the token — no extra DB round-trip needed per request.
 *
 * Implements {@link Principal} so that Spring's WebSocket user-destination resolver
 * calls {@link #getName()} and gets the userId string, matching what
 * {@code convertAndSendToUser(userId.toString(), ...)} uses for routing.
 */
@Getter
@AllArgsConstructor
public class UserPrincipal implements Principal {

    private final UUID   userId;
    private final String email;
    private final String role;

    /** Returns the Spring Security authorities derived from the role. */
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    /**
     * Returns the userId as a string — used by Spring's WebSocket user-destination
     * resolver to match subscriptions with {@code convertAndSendToUser()} calls.
     */
    @Override
    public String getName() {
        return userId.toString();
    }

    /** Factory: build a UserPrincipal from a raw JWT string. */
    public static UserPrincipal fromToken(JwtTokenProvider jwtTokenProvider, String token) {
        UUID   userId = jwtTokenProvider.extractUserId(token);
        String email  = jwtTokenProvider.extractUsername(token);
        String role   = jwtTokenProvider.extractRole(token);
        return new UserPrincipal(userId, email, role);
    }
}

