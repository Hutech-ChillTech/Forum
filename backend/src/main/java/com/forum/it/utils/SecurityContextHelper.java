package com.forum.it.utils;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;
import com.forum.it.sercurites.UserPrincipal;

/**
 * Utility that reads the authenticated user's identity from the SecurityContext.
 * Controllers and Services call this instead of accepting userId from request body/param.
 */
@Component
public class SecurityContextHelper {

    /**
     * Returns the UUID of the currently authenticated user.
     * Throws UNAUTHORIZED if no valid authentication is present.
     */
    public UUID getCurrentUserId() {
        UserPrincipal principal = getPrincipal();
        return principal.getUserId();
    }

    /**
     * Returns the email of the currently authenticated user.
     */
    public String getCurrentUserEmail() {
        UserPrincipal principal = getPrincipal();
        return principal.getEmail();
    }

    /**
     * Returns the role name of the currently authenticated user.
     */
    public String getCurrentUserRole() {
        UserPrincipal principal = getPrincipal();
        return principal.getRole();
    }

    /**
     * Returns the full UserPrincipal of the currently authenticated user.
     */
    public UserPrincipal getCurrentUser() {
        return getPrincipal();
    }

    /**
     * Returns true when the current user holds the ADMIN role.
     */
    public boolean isAdmin() {
        return "ADMIN".equals(getCurrentUserRole());
    }

    /**
     * Returns true when the current user holds the MODERATOR or ADMIN role.
     */
    public boolean isModeratorOrAdmin() {
        String role = getCurrentUserRole();
        return "ADMIN".equals(role) || "MODERATOR".equals(role);
    }

    // ── private ──────────────────────────────────────────────────────────────

    private UserPrincipal getPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        Object principal = auth.getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return userPrincipal;
    }
}
