package com.aicc.silverlink.global.security.filter;

import com.aicc.silverlink.global.config.internal.InternalApiProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Servlet filter that validates the X-Internal-Api-Key header
 * for all requests to /api/internal/** (excluding /api/internal/callbot/**).
 *
 * <p>
 * This filter runs before the JWT authentication filter and uses
 * constant-time comparison to prevent timing attacks.
 * </p>
 *
 * <p>
 * When {@code internal.api.enabled} is {@code false}, the filter
 * is skipped entirely (useful for local development).
 * </p>
 */
@Slf4j
@RequiredArgsConstructor
public class InternalApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "X-Internal-Api-Key";
    private static final String INTERNAL_PATH_PREFIX = "/api/internal/";
    private static final String CALLBOT_PATH_PREFIX = "/api/internal/callbot/";

    private final InternalApiProperties properties;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only intercept /api/internal/** paths (excluding /api/internal/callbot/**)
        if (!isInternalApiPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip validation when disabled (local development)
        if (!properties.isEnabled()) {
            log.debug("[InternalApiKeyAuthFilter] API key validation disabled. Allowing request to {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        String providedKey = request.getHeader(HEADER_NAME);

        if (providedKey == null || providedKey.isBlank()) {
            log.warn("[InternalApiKeyAuthFilter] Missing {} header for request to {}", HEADER_NAME, path);
            sendUnauthorized(response, "Missing " + HEADER_NAME + " header");
            return;
        }

        if (!isValidApiKey(providedKey)) {
            log.warn("[InternalApiKeyAuthFilter] Invalid API key for request to {}", path);
            sendUnauthorized(response, "Invalid API key");
            return;
        }

        log.debug("[InternalApiKeyAuthFilter] API key validated for request to {}", path);
        filterChain.doFilter(request, response);
    }

    /**
     * Check if the request path is an internal API path that requires key
     * validation.
     * Excludes /api/internal/callbot/** which has its own authentication mechanism.
     */
    private boolean isInternalApiPath(String path) {
        return path.startsWith(INTERNAL_PATH_PREFIX) && !path.startsWith(CALLBOT_PATH_PREFIX);
    }

    /**
     * Validate the provided API key using constant-time comparison
     * to prevent timing attacks.
     */
    private boolean isValidApiKey(String providedKey) {
        String configuredKey = properties.getKey();
        if (configuredKey == null || configuredKey.isBlank()) {
            log.error("[InternalApiKeyAuthFilter] Internal API key is not configured! " +
                    "Set 'internal.api.key' in application.yml or INTERNAL_API_KEY env variable.");
            return false;
        }

        byte[] provided = providedKey.getBytes(StandardCharsets.UTF_8);
        byte[] configured = configuredKey.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(provided, configured);
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                "{\"error\": \"UNAUTHORIZED\", \"message\": \"" + message + "\"}");
    }
}
