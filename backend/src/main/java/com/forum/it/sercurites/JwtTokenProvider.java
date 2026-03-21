package com.forum.it.sercurites;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.forum.it.entities.user.Account;
import com.forum.it.entities.user.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token.expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token.expiration}")
    private long refreshTokenExpiration;

    // ── Token generation ──────────────────────────────────────────────────────

    /**
     * Generates an access token embedding userId, role, and minimal user info.
     */
    public String generateToken(Account account, String roleName) {
        User user = account.getUser();
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId().toString());
        claims.put("email", account.getEmail());
        claims.put("role", roleName);
        // Keep additional claims minimal to reduce token size
        claims.put("userName", user.getUserName());
        claims.put("avatarURL", user.getAvatarURL());
        claims.put("verifyStatus", user.getVerifyStatus().name());
        claims.put("status", user.getStatus().name());

        return Jwts.builder()
                .setSubject(account.getEmail())
                .addClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generates a refresh token — subject only, no extra claims.
     */
    public String generateRefreshToken(Account account) {
        return Jwts.builder()
                .setSubject(account.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ── Claim extraction ──────────────────────────────────────────────────────

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extracts userId from access-token claims. */
    public UUID extractUserId(String token) {
        String raw = extractClaim(token, claims -> claims.get("userId", String.class));
        return UUID.fromString(raw);
    }

    /** Extracts the role name from access-token claims. */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    // ── Validation ────────────────────────────────────────────────────────────

    public boolean isTokenValid(String token, String username) {
        return extractUsername(token).equals(username) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Returns the remaining lifetime of the token in milliseconds.
     * Returns 0 if the token is already expired.
     */
    public long getExpirationMillis(String token) {
        long expiry = extractExpiration(token).getTime();
        long remaining = expiry - System.currentTimeMillis();
        return Math.max(0, remaining);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Date extractIssuedAt(String token) {
        return extractClaim(token, Claims::getIssuedAt);
    }

    public long getExpirationTime(String token) {
        return extractExpiration(token).getTime();
    }

    public long getIssuedAtTime(String token) {
        return extractIssuedAt(token).getTime();
    }
}
