package com.forum.it.sercurites;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.forum.it.services.RedisService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Intercepts every request, validates the Bearer JWT and populates the
 * SecurityContext with a {@link UserPrincipal} — avoiding redundant DB lookups.
 * <p>
 * Blacklisted access-tokens (invalidated on logout) are stored in Redis and
 * rejected here.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final RedisService     redisService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest  request,
            HttpServletResponse response,
            FilterChain         filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            // ── Blacklist check ────────────────────────────────────────────────
            if (redisService.hasKey("blacklist:" + jwt)) {
                write401(response, "TOKEN_REVOKED");
                return;
            }

            // ── Parse token without DB round-trip ─────────────────────────────
            String email = jwtTokenProvider.extractUsername(jwt);
            UUID   userId = jwtTokenProvider.extractUserId(jwt);
            String role   = jwtTokenProvider.extractRole(jwt);

            if (email != null
                    && SecurityContextHolder.getContext().getAuthentication() == null
                    && jwtTokenProvider.isTokenValid(jwt, email)) {

                UserPrincipal principal = new UserPrincipal(userId, email, role);
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));

                var authToken = new UsernamePasswordAuthenticationToken(
                        principal, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

            filterChain.doFilter(request, response);

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.debug("Expired JWT for request {}", request.getServletPath());
            write401(response, "ACCESS_TOKEN_EXPIRED");
        } catch (io.jsonwebtoken.security.SignatureException
                 | io.jsonwebtoken.MalformedJwtException e) {
            log.debug("Invalid JWT signature/format: {}", e.getMessage());
            write401(response, "ACCESS_TOKEN_INVALID");
        } catch (Exception e) {
            log.debug("JWT processing error: {}", e.getMessage());
            write401(response, "ACCESS_TOKEN_INVALID");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/v1/auth/login")
                || path.startsWith("/api/v1/auth/register")
                || path.startsWith("/api/v1/auth/refresh-token")
                || path.startsWith("/ws");   // WebSocket handshake handled separately
    }

    // ── private ───────────────────────────────────────────────────────────────

    private void write401(HttpServletResponse response, String errorCode) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":401,\"message\":\"" + errorCode + "\"}");
    }
}

