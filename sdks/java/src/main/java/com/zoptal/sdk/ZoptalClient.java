package com.zoptal.sdk;

import com.zoptal.sdk.auth.AuthManager;
import com.zoptal.sdk.projects.ProjectManager;
import com.zoptal.sdk.ai.AIManager;
import com.zoptal.sdk.collaboration.CollaborationManager;
import com.zoptal.sdk.files.FileManager;
import com.zoptal.sdk.http.HttpClient;
import com.zoptal.sdk.exceptions.ZoptalException;
import com.zoptal.sdk.exceptions.AuthenticationException;

import java.util.Map;
import java.util.logging.Logger;
import java.util.logging.Level;

/**
 * Main client for interacting with the Zoptal API.
 * 
 * This client provides access to all Zoptal services including projects,
 * AI assistance, collaboration features, and file management.
 * 
 * <p>Example usage:
 * <pre>{@code
 * ZoptalClient client = new ZoptalClient("your-api-key");
 * List<Project> projects = client.getProjects().list();
 * System.out.println("Found " + projects.size() + " projects");
 * }</pre>
 * 
 * @author Zoptal Development Team
 * @version 1.0.0
 * @since 1.0.0
 */
public class ZoptalClient implements AutoCloseable {
    
    private static final Logger LOGGER = Logger.getLogger(ZoptalClient.class.getName());
    private static final String DEFAULT_BASE_URL = "https://api.zoptal.com";
    
    private final String apiKey;
    private final String baseUrl;
    private final int timeout;
    private final int maxRetries;
    private final HttpClient httpClient;
    
    // Service managers
    private final AuthManager authManager;
    private final ProjectManager projectManager;
    private final AIManager aiManager;
    private final CollaborationManager collaborationManager;
    private final FileManager fileManager;
    
    /**
     * Create a new Zoptal client with default settings.
     * 
     * @param apiKey Your Zoptal API key
     * @throws AuthenticationException if the API key is null or empty
     */
    public ZoptalClient(String apiKey) {
        this(apiKey, DEFAULT_BASE_URL, 30000, 3, false);
    }
    
    /**
     * Create a new Zoptal client with custom settings.
     * 
     * @param apiKey Your Zoptal API key
     * @param baseUrl Base URL for the Zoptal API
     * @param timeoutMs Request timeout in milliseconds
     * @param maxRetries Maximum number of retries for failed requests
     * @param debug Enable debug logging
     * @throws AuthenticationException if the API key is null or empty
     */
    public ZoptalClient(String apiKey, String baseUrl, int timeoutMs, int maxRetries, boolean debug) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new AuthenticationException("API key is required");
        }
        
        this.apiKey = apiKey.trim();
        this.baseUrl = baseUrl != null ? baseUrl.replaceAll("/$", "") : DEFAULT_BASE_URL;
        this.timeout = timeoutMs > 0 ? timeoutMs : 30000;
        this.maxRetries = maxRetries >= 0 ? maxRetries : 3;
        
        // Configure logging
        if (debug) {
            LOGGER.setLevel(Level.FINE);
        }
        
        // Initialize HTTP client
        this.httpClient = new HttpClient(this.baseUrl, this.apiKey, this.timeout, this.maxRetries);
        
        // Initialize service managers
        this.authManager = new AuthManager(this.httpClient);
        this.projectManager = new ProjectManager(this.httpClient);
        this.aiManager = new AIManager(this.httpClient);
        this.collaborationManager = new CollaborationManager(this.httpClient);
        this.fileManager = new FileManager(this.httpClient);
        
        LOGGER.info("Zoptal SDK client initialized");
    }
    
    /**
     * Get the authentication manager.
     * 
     * @return AuthManager instance for authentication operations
     */
    public AuthManager getAuth() {
        return authManager;
    }
    
    /**
     * Get the project manager.
     * 
     * @return ProjectManager instance for project operations
     */
    public ProjectManager getProjects() {
        return projectManager;
    }
    
    /**
     * Get the AI manager.
     * 
     * @return AIManager instance for AI operations
     */
    public AIManager getAI() {
        return aiManager;
    }
    
    /**
     * Get the collaboration manager.
     * 
     * @return CollaborationManager instance for collaboration operations
     */
    public CollaborationManager getCollaboration() {
        return collaborationManager;
    }
    
    /**
     * Get the file manager.
     * 
     * @return FileManager instance for file operations
     */
    public FileManager getFiles() {
        return fileManager;
    }
    
    /**
     * Check the health status of the Zoptal API.
     * 
     * @return Map containing health status information
     * @throws ZoptalException if the health check fails
     */
    public Map<String, Object> healthCheck() throws ZoptalException {
        try {
            return httpClient.get("/health", Map.class);
        } catch (Exception e) {
            throw new ZoptalException("Health check failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get information about the authenticated user.
     * 
     * @return Map containing user information
     * @throws AuthenticationException if authentication fails
     * @throws ZoptalException if the request fails
     */
    public Map<String, Object> getUserInfo() throws ZoptalException {
        try {
            return httpClient.get("/user/profile", Map.class);
        } catch (Exception e) {
            if (e.getMessage().contains("401") || e.getMessage().toLowerCase().contains("unauthorized")) {
                throw new AuthenticationException("Invalid API key or expired token");
            }
            throw new ZoptalException("Failed to get user info: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get usage statistics for the authenticated user.
     * 
     * @return Map containing usage statistics including API requests made,
     *         AI tokens consumed, storage used, and collaboration sessions
     * @throws ZoptalException if the request fails
     */
    public Map<String, Object> getUsageStats() throws ZoptalException {
        try {
            return httpClient.get("/user/usage", Map.class);
        } catch (Exception e) {
            throw new ZoptalException("Failed to get usage stats: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get the API key being used by this client.
     * 
     * @return The API key (masked for security)
     */
    public String getApiKey() {
        if (apiKey.length() > 8) {
            return apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length() - 4);
        }
        return "****";
    }
    
    /**
     * Get the base URL being used by this client.
     * 
     * @return The base URL
     */
    public String getBaseUrl() {
        return baseUrl;
    }
    
    /**
     * Get the timeout setting for this client.
     * 
     * @return Timeout in milliseconds
     */
    public int getTimeout() {
        return timeout;
    }
    
    /**
     * Get the maximum retries setting for this client.
     * 
     * @return Maximum number of retries
     */
    public int getMaxRetries() {
        return maxRetries;
    }
    
    /**
     * Close the client and clean up resources.
     * 
     * This should be called when you're done using the client,
     * especially in long-running applications.
     */
    @Override
    public void close() {
        if (httpClient != null) {
            httpClient.close();
        }
        LOGGER.info("Zoptal SDK client closed");
    }
    
    @Override
    public String toString() {
        return String.format("ZoptalClient{baseUrl='%s', timeout=%d, maxRetries=%d}", 
                           baseUrl, timeout, maxRetries);
    }
}