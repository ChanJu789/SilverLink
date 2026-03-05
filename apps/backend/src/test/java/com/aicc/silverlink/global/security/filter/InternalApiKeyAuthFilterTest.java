package com.aicc.silverlink.global.security.filter;

import com.aicc.silverlink.global.config.internal.InternalApiProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link InternalApiKeyAuthFilter}.
 */
class InternalApiKeyAuthFilterTest {

    private static final String VALID_API_KEY = "test-secret-key-12345";
    private static final String HEADER_NAME = "X-Internal-Api-Key";

    private InternalApiProperties properties;
    private InternalApiKeyAuthFilter filter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        properties = new InternalApiProperties();
        properties.setKey(VALID_API_KEY);
        properties.setEnabled(true);
        filter = new InternalApiKeyAuthFilter(properties);
        filterChain = mock(FilterChain.class);
    }

    @Nested
    @DisplayName("When request targets /api/internal/emergency-alerts/**")
    class InternalEmergencyAlertPaths {

        @Test
        @DisplayName("Should pass through with valid API key")
        void validApiKey_ShouldPassThrough() throws ServletException, IOException {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/internal/emergency-alerts");
            request.addHeader(HEADER_NAME, VALID_API_KEY);
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(200);
        }

        @Test
        @DisplayName("Should return 401 with invalid API key")
        void invalidApiKey_ShouldReturn401() throws ServletException, IOException {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/internal/emergency-alerts");
            request.addHeader(HEADER_NAME, "wrong-key");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain, never()).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(401);
            assertThat(response.getContentAsString()).contains("Invalid API key");
        }

        @Test
        @DisplayName("Should return 401 when API key header is missing")
        void missingApiKey_ShouldReturn401() throws ServletException, IOException {
            MockHttpServletRequest request = new MockHttpServletRequest("POST",
                    "/api/internal/emergency-alerts/health");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain, never()).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(401);
            assertThat(response.getContentAsString()).contains("Missing");
        }

        @Test
        @DisplayName("Should return 401 when API key header is blank")
        void blankApiKey_ShouldReturn401() throws ServletException, IOException {
            MockHttpServletRequest request = new MockHttpServletRequest("POST",
                    "/api/internal/emergency-alerts/mental");
            request.addHeader(HEADER_NAME, "   ");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain, never()).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(401);
        }
    }

    @Nested
    @DisplayName("When request targets non-internal paths")
    class NonInternalPaths {

        @Test
        @DisplayName("Should pass through without checking API key")
        void nonInternalPath_ShouldPassThrough() throws ServletException, IOException {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/login");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(200);
        }

        @Test
        @DisplayName("Should pass through for /api/internal/callbot/** paths")
        void callbotPath_ShouldPassThrough() throws ServletException, IOException {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/internal/callbot/some-endpoint");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(200);
        }
    }

    @Nested
    @DisplayName("When filter is disabled")
    class FilterDisabled {

        @Test
        @DisplayName("Should pass through all internal requests without validation")
        void disabledFilter_ShouldPassThrough() throws ServletException, IOException {
            properties.setEnabled(false);

            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/internal/emergency-alerts");
            // No API key header set
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(200);
        }
    }

    @Nested
    @DisplayName("When API key is not configured")
    class ApiKeyNotConfigured {

        @Test
        @DisplayName("Should return 401 when server key is null")
        void nullServerKey_ShouldReturn401() throws ServletException, IOException {
            properties.setKey(null);

            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/internal/emergency-alerts");
            request.addHeader(HEADER_NAME, "some-key");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain, never()).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(401);
        }

        @Test
        @DisplayName("Should return 401 when server key is blank")
        void blankServerKey_ShouldReturn401() throws ServletException, IOException {
            properties.setKey("   ");

            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/internal/emergency-alerts");
            request.addHeader(HEADER_NAME, "some-key");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain, never()).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(401);
        }
    }
}
