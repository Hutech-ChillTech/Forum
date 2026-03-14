package com.forum.it.utils;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

/**
 * XSS / HTML-injection sanitisation utilities.
 * Uses Jsoup under the hood; safe for use in services and filters alike.
 */
public final class SanitizationUtil {

    /**
     * Strips all HTML tags — safe for plain-text fields such as usernames,
     * post titles, and tag names.
     */
    public static String stripHtml(String input) {
        if (input == null) return null;
        return Jsoup.clean(input, Safelist.none());
    }

    /**
     * Strips HTML but retains a minimal set of formatting tags (b, i, u, br, p,
     * ul, ol, li).  Suitable for rich-text post / comment content.
     */
    public static String sanitizeHtml(String input) {
        if (input == null) return null;
        return Jsoup.clean(input, Safelist.basic());
    }

    /**
     * Encodes characters that have special meaning in HTML.
     * Useful when content will be interpolated into HTML context outside Jsoup.
     */
    public static String htmlEncode(String input) {
        if (input == null) return null;
        return input
                .replace("&",  "&amp;")
                .replace("<",  "&lt;")
                .replace(">",  "&gt;")
                .replace("\"", "&quot;")
                .replace("'",  "&#x27;");
    }

    private SanitizationUtil() {}
}
