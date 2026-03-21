package com.forum.it.filters;

import java.io.IOException;

import org.springframework.web.filter.OncePerRequestFilter;

import com.forum.it.utils.SanitizationUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Strips HTML/script tags from all query-string and form parameters
 * before they reach any controller.
 * Body JSON sanitisation is handled per-field in services via {@link SanitizationUtil}.
 */
public class XssFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        chain.doFilter(new XssRequestWrapper(request), response);
    }

    // ── inner wrapper ─────────────────────────────────────────────────────────

    private static class XssRequestWrapper extends HttpServletRequestWrapper {

        XssRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            return SanitizationUtil.stripHtml(super.getParameter(name));
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] values = super.getParameterValues(name);
            if (values == null) return null;
            String[] sanitized = new String[values.length];
            for (int i = 0; i < values.length; i++) {
                sanitized[i] = SanitizationUtil.stripHtml(values[i]);
            }
            return sanitized;
        }

        @Override
        public String getHeader(String name) {
            // Let Authorization / Content-Type headers pass through unchanged.
            return super.getHeader(name);
        }
    }
}
