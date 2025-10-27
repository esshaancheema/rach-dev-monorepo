// Package zoptal provides a Go SDK for the Zoptal AI-powered development platform.
//
// This SDK allows you to interact with all Zoptal services including projects,
// AI assistance, collaboration features, and file management.
//
// Example usage:
//
//	client := zoptal.NewClient("your-api-key")
//	projects, err := client.Projects.List(context.Background(), nil)
//	if err != nil {
//	    log.Fatal(err)
//	}
//	fmt.Printf("Found %d projects\n", len(projects.Projects))
package zoptal

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"
)

// Client is the main client for interacting with the Zoptal API.
//
// This client provides access to all Zoptal services including projects,
// AI assistance, collaboration features, and file management.
type Client struct {
	// Service managers
	Auth          *AuthService
	Projects      *ProjectService
	AI            *AIService
	Collaboration *CollaborationService
	Files         *FileService

	// Internal HTTP client
	httpClient *HTTPClient
	apiKey     string
	baseURL    string
	timeout    time.Duration
	maxRetries int
	debug      bool
}

// ClientOptions contains options for configuring the Zoptal client.
type ClientOptions struct {
	// BaseURL is the base URL for the Zoptal API (default: "https://api.zoptal.com")
	BaseURL string

	// Timeout is the request timeout (default: 30 seconds)
	Timeout time.Duration

	// MaxRetries is the maximum number of retries for failed requests (default: 3)
	MaxRetries int

	// Debug enables debug logging (default: false)
	Debug bool

	// HTTPClient is a custom HTTP client to use (optional)
	HTTPClient *http.Client
}

// NewClient creates a new Zoptal client with default settings.
//
// Parameters:
//   - apiKey: Your Zoptal API key
//
// Returns a new Client instance configured with default settings.
func NewClient(apiKey string) *Client {
	return NewClientWithOptions(apiKey, nil)
}

// NewClientWithOptions creates a new Zoptal client with custom options.
//
// Parameters:
//   - apiKey: Your Zoptal API key
//   - options: Custom client options (can be nil for defaults)
//
// Returns a new Client instance configured with the specified options.
func NewClientWithOptions(apiKey string, options *ClientOptions) *Client {
	if apiKey == "" {
		panic("API key is required")
	}

	// Set default options
	if options == nil {
		options = &ClientOptions{}
	}
	if options.BaseURL == "" {
		options.BaseURL = "https://api.zoptal.com"
	}
	if options.Timeout == 0 {
		options.Timeout = 30 * time.Second
	}
	if options.MaxRetries == 0 {
		options.MaxRetries = 3
	}

	// Configure logging
	if options.Debug {
		log.SetFlags(log.LstdFlags | log.Lshortfile)
	}

	// Create HTTP client
	httpClient := NewHTTPClient(HTTPClientConfig{
		BaseURL:    options.BaseURL,
		APIKey:     apiKey,
		Timeout:    options.Timeout,
		MaxRetries: options.MaxRetries,
		Debug:      options.Debug,
		HTTPClient: options.HTTPClient,
	})

	client := &Client{
		httpClient: httpClient,
		apiKey:     apiKey,
		baseURL:    options.BaseURL,
		timeout:    options.Timeout,
		maxRetries: options.MaxRetries,
		debug:      options.Debug,
	}

	// Initialize service managers
	client.Auth = &AuthService{client: httpClient}
	client.Projects = &ProjectService{client: httpClient}
	client.AI = &AIService{client: httpClient}
	client.Collaboration = &CollaborationService{client: httpClient}
	client.Files = &FileService{client: httpClient}

	if options.Debug {
		log.Println("Zoptal SDK client initialized")
	}

	return client
}

// HealthCheck checks the health status of the Zoptal API.
//
// Parameters:
//   - ctx: Request context for cancellation and timeouts
//
// Returns a map containing health status information or an error if the health check fails.
func (c *Client) HealthCheck(ctx context.Context) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.httpClient.Get(ctx, "/health", nil, &result)
	if err != nil {
		return nil, fmt.Errorf("health check failed: %w", err)
	}
	return result, nil
}

// GetUserInfo gets information about the authenticated user.
//
// Parameters:
//   - ctx: Request context for cancellation and timeouts
//
// Returns a map containing user information or an error if the request fails.
func (c *Client) GetUserInfo(ctx context.Context) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.httpClient.Get(ctx, "/user/profile", nil, &result)
	if err != nil {
		if IsAuthenticationError(err) {
			return nil, NewAuthenticationError("invalid API key or expired token")
		}
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	return result, nil
}

// GetUsageStats gets usage statistics for the authenticated user.
//
// Parameters:
//   - ctx: Request context for cancellation and timeouts
//
// Returns a map containing usage statistics including API requests made,
// AI tokens consumed, storage used, and collaboration sessions, or an error if the request fails.
func (c *Client) GetUsageStats(ctx context.Context) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.httpClient.Get(ctx, "/user/usage", nil, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to get usage stats: %w", err)
	}
	return result, nil
}

// GetAPIKey returns the API key being used by this client (masked for security).
//
// Returns the API key with most characters masked for security purposes.
func (c *Client) GetAPIKey() string {
	if len(c.apiKey) > 8 {
		return c.apiKey[:4] + "****" + c.apiKey[len(c.apiKey)-4:]
	}
	return "****"
}

// GetBaseURL returns the base URL being used by this client.
//
// Returns the base URL string.
func (c *Client) GetBaseURL() string {
	return c.baseURL
}

// GetTimeout returns the timeout setting for this client.
//
// Returns the timeout duration.
func (c *Client) GetTimeout() time.Duration {
	return c.timeout
}

// GetMaxRetries returns the maximum retries setting for this client.
//
// Returns the maximum number of retries for failed requests.
func (c *Client) GetMaxRetries() int {
	return c.maxRetries
}

// IsDebugEnabled returns whether debug logging is enabled.
//
// Returns true if debug logging is enabled, false otherwise.
func (c *Client) IsDebugEnabled() bool {
	return c.debug
}

// Close closes the client and cleans up resources.
//
// This should be called when you're done using the client,
// especially in long-running applications.
func (c *Client) Close() error {
	if c.httpClient != nil {
		c.httpClient.Close()
	}
	if c.debug {
		log.Println("Zoptal SDK client closed")
	}
	return nil
}

// String returns a string representation of the client.
//
// Returns a formatted string with client configuration details.
func (c *Client) String() string {
	return fmt.Sprintf("ZoptalClient{baseURL: %s, timeout: %v, maxRetries: %d}",
		c.baseURL, c.timeout, c.maxRetries)
}