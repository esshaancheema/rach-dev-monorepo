package zoptal

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// HTTPClient handles HTTP requests with retry logic and error handling.
//
// This client handles authentication, rate limiting, retries,
// and error response parsing for all API requests.
type HTTPClient struct {
	baseURL    string
	apiKey     string
	timeout    time.Duration
	maxRetries int
	debug      bool
	client     *http.Client
}

// HTTPClientConfig contains configuration for the HTTP client.
type HTTPClientConfig struct {
	BaseURL    string
	APIKey     string
	Timeout    time.Duration
	MaxRetries int
	Debug      bool
	HTTPClient *http.Client
}

// NewHTTPClient creates a new HTTP client with the specified configuration.
//
// Parameters:
//   - config: HTTP client configuration
//
// Returns a new HTTPClient instance.
func NewHTTPClient(config HTTPClientConfig) *HTTPClient {
	client := config.HTTPClient
	if client == nil {
		client = &http.Client{
			Timeout: config.Timeout,
		}
	}

	return &HTTPClient{
		baseURL:    strings.TrimRight(config.BaseURL, "/"),
		apiKey:     config.APIKey,
		timeout:    config.Timeout,
		maxRetries: config.MaxRetries,
		debug:      config.Debug,
		client:     client,
	}
}

// buildURL builds the full URL from an endpoint.
func (c *HTTPClient) buildURL(endpoint string) string {
	if strings.HasPrefix(endpoint, "http") {
		return endpoint
	}

	endpoint = strings.TrimPrefix(endpoint, "/")
	return fmt.Sprintf("%s/api/v1/%s", c.baseURL, endpoint)
}

// createRequest creates an HTTP request with common headers.
func (c *HTTPClient) createRequest(ctx context.Context, method, endpoint string, body io.Reader) (*http.Request, error) {
	url := c.buildURL(endpoint)
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, err
	}

	// Set common headers
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "zoptal-go-sdk/1.0.0")
	req.Header.Set("Accept", "application/json")

	return req, nil
}

// handleResponse handles HTTP responses and parses errors.
func (c *HTTPClient) handleResponse(resp *http.Response, result interface{}) error {
	defer resp.Body.Close()

	if c.debug {
		log.Printf("HTTP %s %s -> %d", resp.Request.Method, resp.Request.URL, resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	// Handle error status codes
	switch resp.StatusCode {
	case http.StatusUnauthorized:
		return NewAuthenticationError("invalid API key or expired token")
	case http.StatusForbidden:
		return NewAuthenticationError("insufficient permissions")
	case http.StatusNotFound:
		return NewNotFoundError("resource not found")
	case http.StatusUnprocessableEntity:
		var errorData map[string]interface{}
		validationError := "validation failed"
		if json.Unmarshal(body, &errorData) == nil {
			if detail, ok := errorData["detail"].(string); ok {
				validationError = detail
			} else if message, ok := errorData["message"].(string); ok {
				validationError = message
			}
		}
		return NewValidationError(validationError)
	case http.StatusTooManyRequests:
		retryAfter := resp.Header.Get("Retry-After")
		if retryAfter == "" {
			retryAfter = "60"
		}
		return NewRateLimitError(fmt.Sprintf("rate limit exceeded, retry after %s seconds", retryAfter))
	}

	if resp.StatusCode >= 500 {
		return NewAPIError(fmt.Sprintf("server error: %d", resp.StatusCode))
	}

	if resp.StatusCode >= 400 {
		var errorData map[string]interface{}
		errorMsg := fmt.Sprintf("HTTP %d", resp.StatusCode)
		if json.Unmarshal(body, &errorData) == nil {
			if errMsg, ok := errorData["error"].(string); ok {
				errorMsg = errMsg
			} else if message, ok := errorData["message"].(string); ok {
				errorMsg = message
			}
		}
		return NewAPIError(errorMsg)
	}

	// Parse successful response
	if result != nil && len(body) > 0 {
		if err := json.Unmarshal(body, result); err != nil {
			return fmt.Errorf("failed to parse response JSON: %w", err)
		}
	}

	return nil
}

// executeWithRetry executes an HTTP request with retry logic.
func (c *HTTPClient) executeWithRetry(ctx context.Context, req *http.Request, result interface{}) error {
	var lastErr error

	for attempt := 0; attempt <= c.maxRetries; attempt++ {
		// Clone the request body for retries
		var bodyReader io.Reader
		if req.Body != nil {
			if req.GetBody != nil {
				var err error
				bodyReader, err = req.GetBody()
				if err != nil {
					return fmt.Errorf("failed to get request body for retry: %w", err)
				}
			}
		}

		// Create new request for retry
		retryReq := req.Clone(ctx)
		if bodyReader != nil {
			retryReq.Body = io.NopCloser(bodyReader)
		}

		resp, err := c.client.Do(retryReq)
		if err != nil {
			lastErr = err
			if attempt < c.maxRetries {
				// Wait before retrying
				select {
				case <-time.After(time.Duration(attempt+1) * time.Second):
					continue
				case <-ctx.Done():
					return ctx.Err()
				}
			}
			continue
		}

		err = c.handleResponse(resp, result)
		if err != nil {
			// Don't retry on authentication errors or validation errors
			if IsAuthenticationError(err) || IsValidationError(err) || IsNotFoundError(err) {
				return err
			}

			// Retry on rate limit errors with exponential backoff
			if IsRateLimitError(err) && attempt < c.maxRetries {
				select {
				case <-time.After(time.Duration(2*(attempt+1)) * time.Second):
					lastErr = err
					continue
				case <-ctx.Done():
					return ctx.Err()
				}
			}

			lastErr = err
			if attempt < c.maxRetries {
				// Wait before retrying
				select {
				case <-time.After(time.Duration(attempt+1) * time.Second):
					continue
				case <-ctx.Done():
					return ctx.Err()
				}
			}
		} else {
			return nil // Success
		}
	}

	if lastErr != nil {
		return fmt.Errorf("request failed after %d attempts: %w", c.maxRetries+1, lastErr)
	}

	return fmt.Errorf("request failed after %d attempts", c.maxRetries+1)
}

// Get makes a GET request.
//
// Parameters:
//   - ctx: Request context for cancellation and timeouts
//   - endpoint: API endpoint
//   - params: Query parameters (can be nil)
//   - result: Pointer to store the parsed response
//
// Returns an error if the request fails.
func (c *HTTPClient) Get(ctx context.Context, endpoint string, params map[string]string, result interface{}) error {
	// Add query parameters
	if params != nil && len(params) > 0 {
		u, err := url.Parse(c.buildURL(endpoint))
		if err != nil {
			return fmt.Errorf("failed to parse URL: %w", err)
		}

		q := u.Query()
		for key, value := range params {
			q.Set(key, value)
		}
		u.RawQuery = q.Encode()
		endpoint = u.String()
	}

	req, err := c.createRequest(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	return c.executeWithRetry(ctx, req, result)
}

// Post makes a POST request.
//
// Parameters:
//   - ctx: Request context for cancellation and timeouts
//   - endpoint: API endpoint
//   - data: Request body data (will be JSON encoded)
//   - result: Pointer to store the parsed response
//
// Returns an error if the request fails.
func (c *HTTPClient) Post(ctx context.Context, endpoint string, data interface{}, result interface{}) error {
	var body io.Reader
	if data != nil {
		jsonData, err := json.Marshal(data)
		if err != nil {
			return fmt.Errorf("failed to marshal request data: %w", err)
		}
		body = bytes.NewReader(jsonData)
	}

	req, err := c.createRequest(ctx, http.MethodPost, endpoint, body)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set GetBody for retries
	if data != nil {
		req.GetBody = func() (io.ReadCloser, error) {
			jsonData, err := json.Marshal(data)
			if err != nil {
				return nil, err
			}
			return io.NopCloser(bytes.NewReader(jsonData)), nil
		}
	}

	return c.executeWithRetry(ctx, req, result)
}

// Put makes a PUT request.
//
// Parameters:
//   - ctx: Request context for cancellation and timeouts
//   - endpoint: API endpoint
//   - data: Request body data (will be JSON encoded)
//   - result: Pointer to store the parsed response
//
// Returns an error if the request fails.
func (c *HTTPClient) Put(ctx context.Context, endpoint string, data interface{}, result interface{}) error {
	var body io.Reader
	if data != nil {
		jsonData, err := json.Marshal(data)
		if err != nil {
			return fmt.Errorf("failed to marshal request data: %w", err)
		}
		body = bytes.NewReader(jsonData)
	}

	req, err := c.createRequest(ctx, http.MethodPut, endpoint, body)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set GetBody for retries
	if data != nil {
		req.GetBody = func() (io.ReadCloser, error) {
			jsonData, err := json.Marshal(data)
			if err != nil {
				return nil, err
			}
			return io.NopCloser(bytes.NewReader(jsonData)), nil
		}
	}

	return c.executeWithRetry(ctx, req, result)
}

// Patch makes a PATCH request.
//
// Parameters:
//   - ctx: Request context for cancellation and timeouts
//   - endpoint: API endpoint
//   - data: Request body data (will be JSON encoded)
//   - result: Pointer to store the parsed response
//
// Returns an error if the request fails.
func (c *HTTPClient) Patch(ctx context.Context, endpoint string, data interface{}, result interface{}) error {
	var body io.Reader
	if data != nil {
		jsonData, err := json.Marshal(data)
		if err != nil {
			return fmt.Errorf("failed to marshal request data: %w", err)
		}
		body = bytes.NewReader(jsonData)
	}

	req, err := c.createRequest(ctx, http.MethodPatch, endpoint, body)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set GetBody for retries
	if data != nil {
		req.GetBody = func() (io.ReadCloser, error) {
			jsonData, err := json.Marshal(data)
			if err != nil {
				return nil, err
			}
			return io.NopCloser(bytes.NewReader(jsonData)), nil
		}
	}

	return c.executeWithRetry(ctx, req, result)
}

// Delete makes a DELETE request.
//
// Parameters:
//   - ctx: Request context for cancellation and timeouts
//   - endpoint: API endpoint
//   - result: Pointer to store the parsed response
//
// Returns an error if the request fails.
func (c *HTTPClient) Delete(ctx context.Context, endpoint string, result interface{}) error {
	req, err := c.createRequest(ctx, http.MethodDelete, endpoint, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	return c.executeWithRetry(ctx, req, result)
}

// Close closes the HTTP client and cleans up resources.
func (c *HTTPClient) Close() {
	if c.client != nil {
		// Close idle connections
		c.client.CloseIdleConnections()
	}
	if c.debug {
		log.Println("HTTP client closed")
	}
}