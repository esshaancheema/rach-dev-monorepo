// Zoptal Go SDK - Basic Usage Examples
//
// This program demonstrates basic usage of the Zoptal Go SDK including:
// - Client initialization
// - AI code generation
// - Project management
// - File operations
// - Error handling
//
// Requirements:
//   go mod init your-project
//   go get github.com/zoptal/zoptal-go-sdk
//
// Usage:
//   export ZOPTAL_API_KEY="your-api-key"
//   go run basic_usage.go

package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/zoptal/zoptal-go-sdk"
)

func main() {
	fmt.Println("🎉 Zoptal Go SDK - Basic Usage Examples")
	fmt.Println(strings.Repeat("=", 60))

	// Initialize client
	client := demonstrateClientInitialization()
	if client == nil {
		return
	}
	defer client.Close()

	// Create context with timeout for all operations
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	// Run demonstrations
	demonstrateHealthCheck(ctx, client)
	demonstrateUserInfo(ctx, client)
	demonstrateAIFeatures(ctx, client)
	demonstrateProjectManagement(ctx, client)
	demonstrateAdvancedFeatures(ctx, client)
	demonstrateErrorHandling(ctx, client)

	fmt.Println("\n🎉 All demonstrations completed successfully!")
	fmt.Println("\n📚 Next Steps:")
	fmt.Println("   - Explore the full API documentation")
	fmt.Println("   - Check out advanced examples")
	fmt.Println("   - Join our community Discord")
	fmt.Println("   - Build something awesome!")
	fmt.Println("\n🔚 Demo finished")
}

// demonstrateClientInitialization shows client initialization and configuration
func demonstrateClientInitialization() *zoptal.Client {
	fmt.Println("\n🔧 Client Initialization")
	fmt.Println(strings.Repeat("=", 50))

	apiKey := getAPIKey()
	if apiKey == "" {
		return nil
	}

	// Basic client initialization
	client := zoptal.NewClient(apiKey)
	fmt.Printf("✅ Client initialized: %s\n", client)
	fmt.Printf("   API Key: %s\n", client.GetAPIKey())
	fmt.Printf("   Base URL: %s\n", client.GetBaseURL())

	// Advanced client with custom options
	advancedClient := zoptal.NewClientWithOptions(apiKey, &zoptal.ClientOptions{
		BaseURL:    "https://api.zoptal.com",
		Timeout:    60 * time.Second,
		MaxRetries: 5,
		Debug:      true,
	})
	fmt.Printf("✅ Advanced client: %s\n", advancedClient)
	
	// Close the advanced client since we're using the basic one
	advancedClient.Close()

	return client
}

// getAPIKey retrieves the API key from environment variable
func getAPIKey() string {
	apiKey := os.Getenv("ZOPTAL_API_KEY")
	if apiKey == "" {
		fmt.Println("❌ Please set ZOPTAL_API_KEY environment variable")
		fmt.Println("   export ZOPTAL_API_KEY='your-api-key'")
		return ""
	}
	return apiKey
}

// demonstrateHealthCheck shows API health check
func demonstrateHealthCheck(ctx context.Context, client *zoptal.Client) {
	fmt.Println("\n❤️  Health Check")
	fmt.Println(strings.Repeat("=", 50))

	health, err := client.HealthCheck(ctx)
	if err != nil {
		fmt.Printf("❌ Health check failed: %v\n", err)
		return
	}

	fmt.Println("✅ API is healthy!")
	fmt.Printf("   Status: %v\n", health["status"])
	fmt.Printf("   Timestamp: %v\n", health["timestamp"])
	fmt.Printf("   Version: %v\n", health["version"])
}

// demonstrateUserInfo shows getting user information
func demonstrateUserInfo(ctx context.Context, client *zoptal.Client) {
	fmt.Println("\n👤 User Information")
	fmt.Println(strings.Repeat("=", 50))

	userInfo, err := client.GetUserInfo(ctx)
	if err != nil {
		if zoptal.IsAuthenticationError(err) {
			fmt.Println("❌ Authentication failed - check your API key")
		} else {
			fmt.Printf("❌ Failed to get user info: %v\n", err)
		}
		return
	}

	fmt.Println("✅ User information retrieved!")
	fmt.Printf("   Name: %v\n", getOrDefault(userInfo, "name", "N/A"))
	fmt.Printf("   Email: %v\n", getOrDefault(userInfo, "email", "N/A"))
	fmt.Printf("   Plan: %v\n", getOrDefault(userInfo, "plan", "N/A"))
	fmt.Printf("   Account ID: %v\n", getOrDefault(userInfo, "id", "N/A"))

	// Get usage statistics
	usage, err := client.GetUsageStats(ctx)
	if err != nil {
		fmt.Printf("❌ Failed to get usage stats: %v\n", err)
		return
	}

	fmt.Println("\n📊 Usage Statistics:")
	fmt.Printf("   API Requests: %v\n", getOrDefault(usage, "api_requests", 0))
	fmt.Printf("   AI Tokens: %v\n", getOrDefault(usage, "ai_tokens", 0))
	fmt.Printf("   Storage Used: %v MB\n", getOrDefault(usage, "storage_used", 0))
}

// demonstrateAIFeatures shows AI code generation and analysis features
func demonstrateAIFeatures(ctx context.Context, client *zoptal.Client) {
	fmt.Println("\n🤖 AI Features")
	fmt.Println(strings.Repeat("=", 50))

	// Simple code generation
	fmt.Println("Generating a simple function...")
	result, err := client.AI.GenerateCode(ctx, &zoptal.CodeGenerationRequest{
		Prompt:   "Create a Go function that calculates the factorial of a number",
		Language: "go",
	})
	if err != nil {
		if zoptal.IsRateLimitError(err) {
			fmt.Printf("❌ Rate limit exceeded: %v\n", err)
			fmt.Println("   Please wait before making more requests")
		} else if zoptal.IsValidationError(err) {
			fmt.Printf("❌ Validation error: %v\n", err)
		} else {
			fmt.Printf("❌ AI operation failed: %v\n", err)
		}
		return
	}

	fmt.Println("✅ Code generated successfully!")
	fmt.Println("Generated code:")
	fmt.Println(strings.Repeat("-", 40))
	fmt.Println(result.Code)
	fmt.Println(strings.Repeat("-", 40))
	fmt.Printf("Explanation: %s\n", getStringOrDefault(result.Explanation, "No explanation provided"))

	// Advanced code generation with Gin framework
	fmt.Println("\nGenerating a Gin web handler...")
	ginResult, err := client.AI.GenerateCode(ctx, &zoptal.CodeGenerationRequest{
		Prompt:    "Create a Gin HTTP handler for user authentication with JWT tokens",
		Language:  "go",
		Framework: stringPtr("gin"),
		Context: map[string]interface{}{
			"project_type":       "web_api",
			"existing_packages":  []string{"github.com/gin-gonic/gin", "github.com/golang-jwt/jwt"},
			"authentication":     "jwt",
		},
	})
	if err != nil {
		fmt.Printf("❌ Gin handler generation failed: %v\n", err)
		return
	}

	fmt.Println("✅ Gin handler generated!")
	fmt.Printf("Handler size: %d characters\n", len(ginResult.Code))

	// Code analysis
	fmt.Println("\nAnalyzing code quality...")
	sampleCode := `
func processData(data []string) []string {
	var result []string
	for i := 0; i < len(data); i++ {
		if data[i] != "" {
			result = append(result, strings.ToUpper(data[i]))
		}
	}
	return result
}
`

	analysis, err := client.AI.AnalyzeCode(ctx, &zoptal.CodeAnalysisRequest{
		Code:         sampleCode,
		Language:     "go",
		AnalysisType: "comprehensive",
	})
	if err != nil {
		fmt.Printf("❌ Code analysis failed: %v\n", err)
		return
	}

	fmt.Println("✅ Code analysis completed!")
	fmt.Printf("Issues found: %d\n", len(analysis.Issues))
	fmt.Printf("Suggestions: %d\n", len(analysis.Suggestions))

	if len(analysis.Suggestions) > 0 {
		fmt.Println("Top suggestion:")
		fmt.Printf("  - %s\n", analysis.Suggestions[0].Description)
	}
}

// demonstrateProjectManagement shows project management features
func demonstrateProjectManagement(ctx context.Context, client *zoptal.Client) {
	fmt.Println("\n📁 Project Management")
	fmt.Println(strings.Repeat("=", 50))

	// List existing projects
	projects, err := client.Projects.List(ctx, &zoptal.ProjectListOptions{
		Limit: intPtr(5),
	})
	if err != nil {
		fmt.Printf("❌ Failed to list projects: %v\n", err)
		return
	}

	fmt.Printf("✅ Found %d projects\n", projects.Total)
	for i, project := range projects.Projects {
		if i >= 3 {
			break
		}
		fmt.Printf("   📂 %s (ID: %s)\n", project.Name, project.ID)
	}

	// Create a new project
	fmt.Println("\nCreating a new project...")
	newProject, err := client.Projects.Create(ctx, &zoptal.ProjectCreateRequest{
		Name:        "Go SDK Demo Project",
		Template:    "go-web",
		Description: "Project created via Go SDK demo",
		Visibility:  "private",
	})
	if err != nil {
		if zoptal.IsValidationError(err) {
			fmt.Printf("❌ Validation error: %v\n", err)
		} else {
			fmt.Printf("❌ Project creation failed: %v\n", err)
		}
		return
	}

	fmt.Printf("✅ Created project: %s\n", newProject.Name)
	fmt.Printf("   Project ID: %s\n", newProject.ID)
	fmt.Printf("   Template: %s\n", newProject.Template)

	projectID := newProject.ID

	// Get project details
	projectDetails, err := client.Projects.Get(ctx, projectID)
	if err != nil {
		fmt.Printf("❌ Failed to get project details: %v\n", err)
		return
	}

	fmt.Println("✅ Retrieved project details")
	fmt.Printf("   Status: %s\n", projectDetails.Status)
	fmt.Printf("   Created: %s\n", projectDetails.CreatedAt.Format(time.RFC3339))

	// Update project
	_, err = client.Projects.Update(ctx, projectID, &zoptal.ProjectUpdateRequest{
		Description: stringPtr("Updated description via Go SDK"),
	})
	if err != nil {
		fmt.Printf("❌ Failed to update project: %v\n", err)
		return
	}

	fmt.Println("✅ Updated project description")

	// Get available templates
	templates, err := client.Projects.GetTemplates(ctx)
	if err != nil {
		fmt.Printf("❌ Failed to get templates: %v\n", err)
		return
	}

	fmt.Printf("✅ Available templates: %d\n", len(templates))
	for i, template := range templates {
		if i >= 3 {
			break
		}
		fmt.Printf("   🎨 %s - %s\n", template.Name, template.Description)
	}

	// Clean up - delete the demo project
	fmt.Println("\nCleaning up demo project...")
	err = client.Projects.Delete(ctx, projectID)
	if err != nil {
		fmt.Printf("❌ Failed to delete project: %v\n", err)
		return
	}

	fmt.Println("✅ Deleted demo project")
}

// demonstrateAdvancedFeatures shows advanced SDK features
func demonstrateAdvancedFeatures(ctx context.Context, client *zoptal.Client) {
	fmt.Println("\n🚀 Advanced Features")
	fmt.Println(strings.Repeat("=", 50))

	// AI chat functionality
	fmt.Println("Starting AI chat session...")
	chatResponse, err := client.AI.Chat(ctx, &zoptal.ChatRequest{
		Message: "How do I implement graceful shutdown in a Go web server?",
		Context: map[string]interface{}{
			"language":   "go",
			"framework":  "net/http",
			"deployment": "kubernetes",
		},
	})
	if err != nil {
		fmt.Printf("❌ AI chat failed: %v\n", err)
		return
	}

	fmt.Println("✅ AI chat response received")
	fmt.Printf("   Response length: %d\n", len(chatResponse.Response))
	fmt.Printf("   Conversation ID: %s\n", getStringOrDefault(chatResponse.ConversationID, "N/A"))

	// Continue the conversation
	followUp, err := client.AI.Chat(ctx, &zoptal.ChatRequest{
		Message:        "Can you show me a specific example with context.Context?",
		ConversationID: chatResponse.ConversationID,
	})
	if err != nil {
		fmt.Printf("❌ Follow-up chat failed: %v\n", err)
		return
	}

	fmt.Println("✅ Follow-up response received")

	// Code explanation
	fmt.Println("\nExplaining complex code...")
	complexCode := `
package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	server := &http.Server{
		Addr:    ":8080",
		Handler: http.DefaultServeMux,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			panic(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	if err := server.Shutdown(ctx); err != nil {
		panic(err)
	}
}
`

	explanation, err := client.AI.ExplainCode(ctx, &zoptal.CodeExplanationRequest{
		Code:        complexCode,
		Language:    "go",
		DetailLevel: "detailed",
	})
	if err != nil {
		fmt.Printf("❌ Code explanation failed: %v\n", err)
		return
	}

	fmt.Println("✅ Code explanation generated")
	fmt.Printf("   Key concepts: %d\n", len(explanation.KeyConcepts))

	// Test generation
	fmt.Println("\nGenerating unit tests...")
	testCode := `
package math

import "errors"

func CalculateDiscount(price, discountPercent float64) (float64, error) {
	if discountPercent > 100 {
		return 0, errors.New("discount cannot exceed 100%")
	}
	if price < 0 {
		return 0, errors.New("price cannot be negative")
	}
	return price * (1 - discountPercent/100), nil
}
`

	tests, err := client.AI.GenerateTests(ctx, &zoptal.TestGenerationRequest{
		Code:           testCode,
		Language:       "go",
		TestFramework:  stringPtr("testing"),
		CoverageTarget: intPtr(95),
	})
	if err != nil {
		fmt.Printf("❌ Test generation failed: %v\n", err)
		return
	}

	fmt.Println("✅ Unit tests generated")
	fmt.Printf("   Test cases: %d\n", len(tests.TestCases))
	fmt.Printf("   Coverage estimate: %d%%\n", tests.CoverageEstimate)
}

// demonstrateErrorHandling shows comprehensive error handling
func demonstrateErrorHandling(ctx context.Context, client *zoptal.Client) {
	fmt.Println("\n⚠️  Error Handling")
	fmt.Println(strings.Repeat("=", 50))

	// Test different error scenarios
	scenarios := []struct {
		description string
		operation   func() error
	}{
		{
			"Invalid project ID",
			func() error {
				_, err := client.Projects.Get(ctx, "invalid-id")
				return err
			},
		},
		{
			"Empty prompt",
			func() error {
				_, err := client.AI.GenerateCode(ctx, &zoptal.CodeGenerationRequest{
					Prompt: "",
				})
				return err
			},
		},
		{
			"Invalid template",
			func() error {
				_, err := client.Projects.Create(ctx, &zoptal.ProjectCreateRequest{
					Name:     "Test Project",
					Template: "invalid-template",
				})
				return err
			},
		},
	}

	for _, scenario := range scenarios {
		fmt.Printf("\nTesting: %s\n", scenario.description)
		err := scenario.operation()
		if err == nil {
			fmt.Println("   ❌ Expected error but operation succeeded")
			continue
		}

		switch {
		case zoptal.IsValidationError(err):
			fmt.Printf("   ✅ Caught validation error: %v\n", err)
		case zoptal.IsAuthenticationError(err):
			fmt.Printf("   ✅ Caught authentication error: %v\n", err)
		case zoptal.IsRateLimitError(err):
			fmt.Printf("   ✅ Caught rate limit error: %v\n", err)
		case zoptal.IsNotFoundError(err):
			fmt.Printf("   ✅ Caught not found error: %v\n", err)
		case zoptal.IsZoptalError(err):
			fmt.Printf("   ✅ Caught Zoptal error: %v\n", err)
		default:
			fmt.Printf("   ⚠️  Caught unexpected error: %v\n", err)
		}
	}
}

// Helper functions

func getOrDefault(m map[string]interface{}, key string, defaultValue interface{}) interface{} {
	if value, exists := m[key]; exists {
		return value
	}
	return defaultValue
}

func getStringOrDefault(value *string, defaultValue string) string {
	if value != nil {
		return *value
	}
	return defaultValue
}

func stringPtr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}

// Mock types (these would be defined in the actual SDK)

// Note: In a real implementation, these types would be defined in the SDK package.
// For this example, we're showing the structure they would have.

type CodeGenerationRequest struct {
	Prompt    string                 `json:"prompt"`
	Language  string                 `json:"language"`
	Framework *string                `json:"framework,omitempty"`
	Context   map[string]interface{} `json:"context,omitempty"`
}

type CodeAnalysisRequest struct {
	Code         string `json:"code"`
	Language     string `json:"language"`
	AnalysisType string `json:"analysis_type"`
}

type ProjectListOptions struct {
	Limit *int `json:"limit,omitempty"`
}

type ProjectCreateRequest struct {
	Name        string `json:"name"`
	Template    string `json:"template"`
	Description string `json:"description"`
	Visibility  string `json:"visibility"`
}

type ProjectUpdateRequest struct {
	Description *string `json:"description,omitempty"`
}

type ChatRequest struct {
	Message        string                 `json:"message"`
	ConversationID *string                `json:"conversation_id,omitempty"`
	Context        map[string]interface{} `json:"context,omitempty"`
}

type CodeExplanationRequest struct {
	Code        string `json:"code"`
	Language    string `json:"language"`
	DetailLevel string `json:"detail_level"`
}

type TestGenerationRequest struct {
	Code           string  `json:"code"`
	Language       string  `json:"language"`
	TestFramework  *string `json:"test_framework,omitempty"`
	CoverageTarget *int    `json:"coverage_target,omitempty"`
}