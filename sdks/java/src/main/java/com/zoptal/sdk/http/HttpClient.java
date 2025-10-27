package com.zoptal.sdk.http;

import com.zoptal.sdk.exceptions.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.net.http.HttpClient.Redirect;
import java.net.http.HttpClient.Version;

/**
 * HTTP client with built-in retry logic and error handling.
 * 
 * This client handles authentication, rate limiting, retries,
 * and error response parsing for all API requests.
 */
public class HttpClient {
    
    private static final Logger LOGGER = Logger.getLogger(HttpClient.class.getName());
    
    private final String baseUrl;
    private final String apiKey;
    private final int timeoutMs;
    private final int maxRetries;
    private final java.net.http.HttpClient client;
    private final ObjectMapper objectMapper;
    
    /**
     * Create a new HTTP client.
     * 
     * @param baseUrl Base URL for API requests
     * @param apiKey API key for authentication
     * @param timeoutMs Request timeout in milliseconds
     * @param maxRetries Maximum number of retries for failed requests
     */
    public HttpClient(String baseUrl, String apiKey, int timeoutMs, int maxRetries) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.timeoutMs = timeoutMs;
        this.maxRetries = maxRetries;
        
        // Create HTTP client with configuration
        this.client = java.net.http.HttpClient.newBuilder()
                .version(Version.HTTP_2)
                .followRedirects(Redirect.NORMAL)
                .connectTimeout(Duration.ofMillis(timeoutMs))
                .build();
        
        // Configure JSON mapper
        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
    
    /**
     * Build full URL from endpoint.
     * 
     * @param endpoint API endpoint
     * @return Full URL
     */
    private String buildUrl(String endpoint) {
        if (endpoint.startsWith("http")) {
            return endpoint;
        }
        
        String cleanEndpoint = endpoint.startsWith("/") ? endpoint.substring(1) : endpoint;
        return String.format("%s/api/v1/%s", baseUrl, cleanEndpoint);
    }
    
    /**
     * Handle HTTP response and parse errors.
     * 
     * @param response HTTP response
     * @param responseType Expected response type
     * @param <T> Response type
     * @return Parsed response object
     * @throws ZoptalException if the response indicates an error
     */
    private <T> T handleResponse(HttpResponse<String> response, Class<T> responseType) throws ZoptalException {
        try {
            int statusCode = response.statusCode();
            String body = response.body();
            
            LOGGER.log(Level.FINE, "HTTP {0} -> {1}", new Object[]{response.request().uri(), statusCode});
            
            // Handle error status codes
            switch (statusCode) {
                case 401:
                    throw new AuthenticationException("Invalid API key or expired token");
                case 403:
                    throw new AuthenticationException("Insufficient permissions");
                case 404:
                    throw new NotFoundException("Resource not found");
                case 422:
                    String validationError = "Validation failed";
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> errorData = objectMapper.readValue(body, Map.class);
                        if (errorData.containsKey("detail")) {
                            validationError = errorData.get("detail").toString();
                        } else if (errorData.containsKey("message")) {
                            validationError = errorData.get("message").toString();
                        }
                    } catch (Exception ignored) {
                        // Use default message if parsing fails
                    }
                    throw new ValidationException(validationError);
                case 429:
                    String retryAfter = response.headers().firstValue("Retry-After").orElse("60");
                    throw new RateLimitException("Rate limit exceeded. Retry after " + retryAfter + " seconds");
                default:
                    if (statusCode >= 500) {
                        throw new APIException("Server error: " + statusCode);
                    } else if (statusCode >= 400) {
                        String errorMsg = "HTTP " + statusCode;
                        try {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> errorData = objectMapper.readValue(body, Map.class);
                            if (errorData.containsKey("error")) {
                                errorMsg = errorData.get("error").toString();
                            } else if (errorData.containsKey("message")) {
                                errorMsg = errorData.get("message").toString();
                            }
                        } catch (Exception ignored) {
                            // Use default message if parsing fails
                        }
                        throw new APIException(errorMsg);
                    }
            }
            
            // Parse successful response
            if (responseType == String.class) {
                @SuppressWarnings("unchecked")
                T result = (T) body;
                return result;
            } else {
                return objectMapper.readValue(body, responseType);
            }
            
        } catch (AuthenticationException | NotFoundException | ValidationException | 
                 RateLimitException | APIException e) {
            throw e;
        } catch (IOException e) {
            throw new ZoptalException("Failed to parse response: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new ZoptalException("Unexpected error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create base HTTP request builder with common headers.
     * 
     * @param uri Request URI
     * @return HttpRequest.Builder with common headers set
     */
    private HttpRequest.Builder createBaseRequest(URI uri) {
        return HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofMillis(timeoutMs))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("User-Agent", "zoptal-java-sdk/1.0.0")
                .header("Accept", "application/json");
    }
    
    /**
     * Execute HTTP request with retry logic.
     * 
     * @param request HTTP request
     * @param responseType Expected response type
     * @param <T> Response type
     * @return Parsed response
     * @throws ZoptalException if the request fails after all retries
     */
    private <T> T executeWithRetry(HttpRequest request, Class<T> responseType) throws ZoptalException {
        Exception lastException = null;
        
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                return handleResponse(response, responseType);
            } catch (RateLimitException e) {
                if (attempt < maxRetries) {
                    // Wait before retrying on rate limit
                    try {
                        Thread.sleep(2000L * (attempt + 1)); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new ZoptalException("Request interrupted", ie);
                    }
                    lastException = e;
                    continue;
                }
                throw e;
            } catch (IOException | InterruptedException e) {
                if (attempt < maxRetries) {
                    // Wait before retrying on network errors
                    try {
                        Thread.sleep(1000L * (attempt + 1));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new ZoptalException("Request interrupted", ie);
                    }
                    lastException = e;
                    continue;
                }
                throw new ZoptalException("Request failed after " + (attempt + 1) + " attempts", e);
            }
        }
        
        throw new ZoptalException("Request failed after " + (maxRetries + 1) + " attempts", lastException);
    }
    
    /**
     * Make GET request.
     * 
     * @param endpoint API endpoint
     * @param responseType Expected response type
     * @param <T> Response type
     * @return Parsed response
     * @throws ZoptalException if the request fails
     */
    public <T> T get(String endpoint, Class<T> responseType) throws ZoptalException {
        String url = buildUrl(endpoint);
        URI uri = URI.create(url);
        
        HttpRequest request = createBaseRequest(uri)
                .GET()
                .build();
        
        return executeWithRetry(request, responseType);
    }
    
    /**
     * Make POST request.
     * 
     * @param endpoint API endpoint
     * @param data Request body data
     * @param responseType Expected response type
     * @param <T> Response type
     * @return Parsed response
     * @throws ZoptalException if the request fails
     */
    public <T> T post(String endpoint, Object data, Class<T> responseType) throws ZoptalException {
        String url = buildUrl(endpoint);
        URI uri = URI.create(url);
        
        try {
            String jsonBody = data != null ? objectMapper.writeValueAsString(data) : "{}";
            
            HttpRequest request = createBaseRequest(uri)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            return executeWithRetry(request, responseType);
        } catch (IOException e) {
            throw new ZoptalException("Failed to serialize request data", e);
        }
    }
    
    /**
     * Make PUT request.
     * 
     * @param endpoint API endpoint
     * @param data Request body data
     * @param responseType Expected response type
     * @param <T> Response type
     * @return Parsed response
     * @throws ZoptalException if the request fails
     */
    public <T> T put(String endpoint, Object data, Class<T> responseType) throws ZoptalException {
        String url = buildUrl(endpoint);
        URI uri = URI.create(url);
        
        try {
            String jsonBody = data != null ? objectMapper.writeValueAsString(data) : "{}";
            
            HttpRequest request = createBaseRequest(uri)
                    .PUT(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            return executeWithRetry(request, responseType);
        } catch (IOException e) {
            throw new ZoptalException("Failed to serialize request data", e);
        }
    }
    
    /**
     * Make PATCH request.
     * 
     * @param endpoint API endpoint
     * @param data Request body data
     * @param responseType Expected response type
     * @param <T> Response type
     * @return Parsed response
     * @throws ZoptalException if the request fails
     */
    public <T> T patch(String endpoint, Object data, Class<T> responseType) throws ZoptalException {
        String url = buildUrl(endpoint);
        URI uri = URI.create(url);
        
        try {
            String jsonBody = data != null ? objectMapper.writeValueAsString(data) : "{}";
            
            HttpRequest request = createBaseRequest(uri)
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            return executeWithRetry(request, responseType);
        } catch (IOException e) {
            throw new ZoptalException("Failed to serialize request data", e);
        }
    }
    
    /**
     * Make DELETE request.
     * 
     * @param endpoint API endpoint
     * @param responseType Expected response type
     * @param <T> Response type
     * @return Parsed response
     * @throws ZoptalException if the request fails
     */
    public <T> T delete(String endpoint, Class<T> responseType) throws ZoptalException {
        String url = buildUrl(endpoint);
        URI uri = URI.create(url);
        
        HttpRequest request = createBaseRequest(uri)
                .DELETE()
                .build();
        
        return executeWithRetry(request, responseType);
    }
    
    /**
     * Close the HTTP client and clean up resources.
     */
    public void close() {
        // Java 11 HttpClient doesn't require explicit cleanup
        LOGGER.info("HTTP client closed");
    }
}