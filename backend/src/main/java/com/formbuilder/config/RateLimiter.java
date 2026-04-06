package com.formbuilder.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory sliding-window rate limiter keyed by client IP.
 *
 * Defaults: 20 submissions per IP per minute on the public endpoint (MED-01).
 * This is intentionally lightweight — a production deployment should use a
 * distributed solution (Bucket4j + Redis, API Gateway, etc.) instead.
 */
@Component
public class RateLimiter {

    @Value("${app.rate-limit.submissions.max-requests:20}")
    private int maxRequests;

    @Value("${app.rate-limit.submissions.window-seconds:60}")
    private int windowSeconds;

    private record Window(long windowStart, int count) {}

    private final Map<String, Window> store = new ConcurrentHashMap<>();

    /**
     * Returns {@code true} if the caller is allowed to proceed, {@code false} if the rate
     * limit is exceeded.
     */
    public boolean tryAcquire(String clientIp) {
        long now = Instant.now().getEpochSecond();
        long windowStart = now - windowSeconds;

        store.compute(clientIp, (ip, existing) -> {
            if (existing == null || existing.windowStart() < windowStart) {
                return new Window(now, 1);
            }
            return new Window(existing.windowStart(), existing.count() + 1);
        });

        return store.get(clientIp).count() <= maxRequests;
    }
}
