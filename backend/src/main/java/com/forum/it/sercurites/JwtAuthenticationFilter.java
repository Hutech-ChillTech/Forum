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

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final RedisService redisService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String email = jwtTokenProvider.extractUsername(jwt);

            String revokedAtStr = null;
            try {
                revokedAtStr = redisService.getValue("REVOKED_AT:" + email);
            } catch (Exception e) {
                log.warn("Redis is unavailable. Skipping revocation check: {}", e.getMessage());
            }

            if (revokedAtStr != null) {
                long revokedAt = Long.parseLong(revokedAtStr);
                long tokenIssuedAt = jwtTokenProvider.getIssuedAtTime(jwt);
                if (tokenIssuedAt < (revokedAt + 1000)) {
                    throw new io.jsonwebtoken.security.SignatureException("Token has been revoked");
                }
            }

            UUID userId = jwtTokenProvider.extractUserId(jwt);
            String role = jwtTokenProvider.extractRole(jwt);

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
        String method = request.getMethod();
        // Chỉ bỏ qua GET cho các đầu route công khai
        if ("GET".equalsIgnoreCase(method)) {
            if (path.startsWith("/api/v1/posts/") ||
                    path.startsWith("/api/v1/comments/") ||
                    path.startsWith("/api/v1/tags/")) {
                return true;
            }
        }
        // Các route auth mặc định
        return path.startsWith("/api/v1/auth/") || path.startsWith("/ws");
    }

    private void write401(HttpServletResponse response, String errorCode) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":401,\"message\":\"" + errorCode + "\"}");
    }
}
