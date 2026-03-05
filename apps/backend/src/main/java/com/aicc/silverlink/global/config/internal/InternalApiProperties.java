package com.aicc.silverlink.global.config.internal;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Internal API authentication properties.
 *
 * application.yml:
 * internal:
 * api:
 * key: ${INTERNAL_API_KEY:default-dev-key}
 * enabled: true
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "internal.api")
public class InternalApiProperties {

    /**
     * Secret key for internal API authentication.
     * Must match the X-Internal-Api-Key header value sent by CallBot.
     */
    private String key;

    /**
     * Enable/disable internal API key validation.
     * Set to false for local development without CallBot.
     */
    private boolean enabled = true;
}
