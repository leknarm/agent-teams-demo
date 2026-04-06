package com.formbuilder.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.formbuilder.entity.Form;
import com.formbuilder.entity.Submission;
import com.formbuilder.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookServiceImpl implements WebhookService {

    private final ObjectMapper objectMapper;

    /**
     * Headers that callers must not override — doing so could allow request smuggling,
     * credential injection, or other attacks against the receiving server.
     */
    private static final Set<String> BLOCKED_HEADERS = Set.of(
            "host", "authorization", "cookie", "set-cookie",
            "content-length", "transfer-encoding", "connection",
            "x-forwarded-for", "x-forwarded-host", "x-real-ip"
    );

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Override
    @Async
    public void deliverWebhook(Form form, Submission submission) {
        String webhookUrl = (String) form.getSettings().get("webhookUrl");
        if (webhookUrl == null || webhookUrl.isBlank()) {
            return;
        }

        if (!isAllowedWebhookUrl(webhookUrl)) {
            log.warn("Webhook delivery blocked — URL failed SSRF validation: {}", webhookUrl);
            return;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("formId", form.getId().toString());
        payload.put("formName", form.getName());
        payload.put("submissionId", submission.getId().toString());
        payload.put("data", submission.getData());
        payload.put("submittedAt", submission.getSubmittedAt().toString());

        @SuppressWarnings("unchecked")
        Map<String, String> customHeaders = (Map<String, String>) form.getSettings()
                .getOrDefault("webhookHeaders", new HashMap<>());

        sendWithRetry(webhookUrl, payload, customHeaders, 3);
    }

    /**
     * Validates a webhook URL against SSRF risks.
     * Only allows http/https schemes and rejects private/loopback/link-local addresses.
     */
    boolean isAllowedWebhookUrl(String url) {
        try {
            URI uri = URI.create(url);
            String scheme = uri.getScheme();
            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
                return false;
            }
            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                return false;
            }
            // Resolve the hostname to catch DNS-rebinding to private IPs
            InetAddress addr = InetAddress.getByName(host);
            if (addr.isLoopbackAddress()      // 127.x, ::1
                    || addr.isLinkLocalAddress()  // 169.254.x, fe80::
                    || addr.isSiteLocalAddress()  // 10.x, 172.16-31.x, 192.168.x
                    || addr.isAnyLocalAddress()   // 0.0.0.0
                    || addr.isMulticastAddress()) {
                return false;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void sendWithRetry(String url, Map<String, Object> payload,
                                Map<String, String> customHeaders, int maxRetries) {
        long[] delays = {1000L, 2000L, 4000L};

        for (int attempt = 0; attempt < maxRetries; attempt++) {
            try {
                String body = objectMapper.writeValueAsString(payload);
                HttpRequest.Builder builder = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .timeout(Duration.ofSeconds(10));

                for (Map.Entry<String, String> header : customHeaders.entrySet()) {
                    if (!BLOCKED_HEADERS.contains(header.getKey().toLowerCase())) {
                        builder.header(header.getKey(), header.getValue());
                    }
                }

                HttpResponse<String> response = HTTP_CLIENT.send(
                        builder.build(), HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    log.info("Webhook delivered successfully to {} (attempt {})", url, attempt + 1);
                    return;
                }

                log.warn("Webhook delivery failed with status {} (attempt {}/{})",
                        response.statusCode(), attempt + 1, maxRetries);

            } catch (Exception e) {
                log.warn("Webhook delivery error (attempt {}/{}): {}", attempt + 1, maxRetries, e.getMessage());
            }

            if (attempt < maxRetries - 1) {
                try {
                    Thread.sleep(delays[attempt]);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }

        log.error("Webhook delivery failed after {} attempts to {}", maxRetries, url);
    }
}
