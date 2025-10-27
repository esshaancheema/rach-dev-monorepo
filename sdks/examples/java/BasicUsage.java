package com.zoptal.sdk.examples;

import com.zoptal.sdk.ZoptalClient;
import com.zoptal.sdk.exceptions.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.logging.Level;

/**
 * Zoptal Java SDK - Basic Usage Examples
 * 
 * This class demonstrates basic usage of the Zoptal Java SDK including:
 * - Client initialization
 * - AI code generation  
 * - Project management
 * - File operations
 * - Error handling
 * 
 * Requirements:
 *   Maven dependency in pom.xml:
 *   <dependency>
 *     <groupId>com.zoptal</groupId>
 *     <artifactId>zoptal-sdk</artifactId>
 *     <version>1.0.0</version>
 *   </dependency>
 * 
 * Usage:
 *   export ZOPTAL_API_KEY="your-api-key"
 *   mvn compile exec:java -Dexec.mainClass="com.zoptal.sdk.examples.BasicUsage"
 */
public class BasicUsage {
    
    private static final Logger LOGGER = Logger.getLogger(BasicUsage.class.getName());
    
    public static void main(String[] args) {
        System.out.println("🎉 Zoptal Java SDK - Basic Usage Examples");
        System.out.println("=".repeat(60));
        
        // Setup logging
        LOGGER.setLevel(Level.INFO);
        
        try {
            // Initialize client
            ZoptalClient client = demonstrateClientInitialization();
            if (client == null) {
                return;
            }
            
            // Use try-with-resources for automatic cleanup
            try (client) {
                // Run demonstrations
                demonstrateHealthCheck(client);
                demonstrateUserInfo(client);
                demonstrateAIFeatures(client);
                demonstrateProjectManagement(client);
                demonstrateAdvancedFeatures(client);
                demonstrateErrorHandling(client);
                
                System.out.println("\n🎉 All demonstrations completed successfully!");
                System.out.println("\n📚 Next Steps:");
                System.out.println("   - Explore the full API documentation");
                System.out.println("   - Check out advanced examples");
                System.out.println("   - Join our community Discord");
                System.out.println("   - Build something awesome!");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Demo failed with unexpected error: " + e.getMessage());
            LOGGER.log(Level.SEVERE, "Unexpected error during demo", e);
        } finally {
            System.out.println("\n🔚 Demo finished");
        }
    }
    
    /**
     * Demonstrate client initialization and configuration.
     */
    private static ZoptalClient demonstrateClientInitialization() {
        System.out.println("\n🔧 Client Initialization");
        System.out.println("=".repeat(50));
        
        String apiKey = getApiKey();
        if (apiKey == null) {
            return null;
        }
        
        // Basic client initialization
        ZoptalClient client = new ZoptalClient(apiKey);
        System.out.println("✅ Client initialized: " + client);
        System.out.println("   API Key: " + client.getApiKey());
        System.out.println("   Base URL: " + client.getBaseUrl());
        
        // Advanced client with custom settings
        ZoptalClient advancedClient = new ZoptalClient(
            apiKey,
            "https://api.zoptal.com",
            60000, // 60 second timeout
            5,     // 5 retries
            true   // debug mode
        );
        System.out.println("✅ Advanced client: " + advancedClient);
        
        // Close the advanced client since we're using the basic one
        advancedClient.close();
        
        return client;
    }
    
    /**
     * Get API key from environment variable.
     */
    private static String getApiKey() {
        String apiKey = System.getenv("ZOPTAL_API_KEY");
        if (apiKey == null || apiKey.trim().isEmpty()) {
            System.out.println("❌ Please set ZOPTAL_API_KEY environment variable");
            System.out.println("   export ZOPTAL_API_KEY='your-api-key'");
            return null;
        }
        return apiKey;
    }
    
    /**
     * Demonstrate API health check.
     */
    private static void demonstrateHealthCheck(ZoptalClient client) {
        System.out.println("\n❤️  Health Check");
        System.out.println("=".repeat(50));
        
        try {
            Map<String, Object> health = client.healthCheck();
            System.out.println("✅ API is healthy!");
            System.out.println("   Status: " + health.getOrDefault("status", "unknown"));
            System.out.println("   Timestamp: " + health.getOrDefault("timestamp", "unknown"));
            System.out.println("   Version: " + health.getOrDefault("version", "unknown"));
        } catch (Exception e) {
            System.out.println("❌ Health check failed: " + e.getMessage());
        }
    }
    
    /**
     * Demonstrate getting user information.
     */
    private static void demonstrateUserInfo(ZoptalClient client) {
        System.out.println("\n👤 User Information");
        System.out.println("=".repeat(50));
        
        try {
            Map<String, Object> userInfo = client.getUserInfo();
            System.out.println("✅ User information retrieved!");
            System.out.println("   Name: " + userInfo.getOrDefault("name", "N/A"));
            System.out.println("   Email: " + userInfo.getOrDefault("email", "N/A"));
            System.out.println("   Plan: " + userInfo.getOrDefault("plan", "N/A"));
            System.out.println("   Account ID: " + userInfo.getOrDefault("id", "N/A"));
            
            // Get usage statistics
            Map<String, Object> usage = client.getUsageStats();
            System.out.println("\n📊 Usage Statistics:");
            System.out.println("   API Requests: " + usage.getOrDefault("api_requests", 0));
            System.out.println("   AI Tokens: " + usage.getOrDefault("ai_tokens", 0));
            System.out.println("   Storage Used: " + usage.getOrDefault("storage_used", 0) + " MB");
            
        } catch (AuthenticationException e) {
            System.out.println("❌ Authentication failed - check your API key");
        } catch (Exception e) {
            System.out.println("❌ Failed to get user info: " + e.getMessage());
        }
    }
    
    /**
     * Demonstrate AI code generation and analysis features.
     */
    private static void demonstrateAIFeatures(ZoptalClient client) {
        System.out.println("\n🤖 AI Features");
        System.out.println("=".repeat(50));
        
        try {
            // Simple code generation
            System.out.println("Generating a simple function...");
            Map<String, Object> codeGenRequest = new HashMap<>();
            codeGenRequest.put("prompt", "Create a Java method that calculates the factorial of a number");
            codeGenRequest.put("language", "java");
            
            Map<String, Object> result = client.getAI().generateCode(codeGenRequest);
            System.out.println("✅ Code generated successfully!");
            System.out.println("Generated code:");
            System.out.println("-".repeat(40));
            System.out.println(result.get("code"));
            System.out.println("-".repeat(40));
            System.out.println("Explanation: " + result.getOrDefault("explanation", "No explanation provided"));
            
            // Advanced code generation with Spring Boot
            System.out.println("\nGenerating a Spring Boot controller...");
            Map<String, Object> springRequest = new HashMap<>();
            springRequest.put("prompt", "Create a Spring Boot REST controller for user management with CRUD operations");
            springRequest.put("language", "java");
            springRequest.put("framework", "spring-boot");
            
            Map<String, Object> context = new HashMap<>();
            context.put("project_type", "web_api");
            context.put("existing_entities", List.of("User", "Role"));
            context.put("database", "postgresql");
            springRequest.put("context", context);
            
            Map<String, Object> springResult = client.getAI().generateCode(springRequest);
            System.out.println("✅ Spring Boot controller generated!");
            System.out.println("Controller size: " + springResult.get("code").toString().length() + " characters");
            
            // Code analysis
            System.out.println("\nAnalyzing code quality...");
            String sampleCode = """
                public List<String> processData(List<String> data) {
                    List<String> result = new ArrayList<>();
                    for (int i = 0; i < data.size(); i++) {
                        if (data.get(i) != null && data.get(i).length() > 0) {
                            result.add(data.get(i).toUpperCase());
                        }
                    }
                    return result;
                }
                """;
            
            Map<String, Object> analysisRequest = new HashMap<>();
            analysisRequest.put("code", sampleCode);
            analysisRequest.put("language", "java");
            analysisRequest.put("analysis_type", "comprehensive");
            
            Map<String, Object> analysis = client.getAI().analyzeCode(analysisRequest);
            System.out.println("✅ Code analysis completed!");
            
            @SuppressWarnings("unchecked")
            List<Object> issues = (List<Object>) analysis.getOrDefault("issues", List.of());
            @SuppressWarnings("unchecked")
            List<Object> suggestions = (List<Object>) analysis.getOrDefault("suggestions", List.of());
            
            System.out.println("Issues found: " + issues.size());
            System.out.println("Suggestions: " + suggestions.size());
            
            if (!suggestions.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> topSuggestion = (Map<String, Object>) suggestions.get(0);
                System.out.println("Top suggestion:");
                System.out.println("  - " + topSuggestion.get("description"));
            }
            
        } catch (RateLimitException e) {
            System.out.println("❌ Rate limit exceeded: " + e.getMessage());
            System.out.println("   Please wait before making more requests");
        } catch (ValidationException e) {
            System.out.println("❌ Validation error: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ AI operation failed: " + e.getMessage());
        }
    }
    
    /**
     * Demonstrate project management features.
     */
    private static void demonstrateProjectManagement(ZoptalClient client) {
        System.out.println("\n📁 Project Management");
        System.out.println("=".repeat(50));
        
        try {
            // List existing projects
            Map<String, Object> listParams = new HashMap<>();
            listParams.put("limit", 5);
            
            Map<String, Object> projects = client.getProjects().list(listParams);
            Integer totalProjects = (Integer) projects.getOrDefault("total", 0);
            System.out.println("✅ Found " + totalProjects + " projects");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> projectList = (List<Map<String, Object>>) 
                projects.getOrDefault("projects", List.of());
            
            for (int i = 0; i < Math.min(3, projectList.size()); i++) {
                Map<String, Object> project = projectList.get(i);
                System.out.println("   📂 " + project.get("name") + " (ID: " + project.get("id") + ")");
            }
            
            // Create a new project
            System.out.println("\nCreating a new project...");
            Map<String, Object> createRequest = new HashMap<>();
            createRequest.put("name", "Java SDK Demo Project");
            createRequest.put("template", "spring-boot");
            createRequest.put("description", "Project created via Java SDK demo");
            createRequest.put("visibility", "private");
            
            Map<String, Object> newProject = client.getProjects().create(createRequest);
            System.out.println("✅ Created project: " + newProject.get("name"));
            System.out.println("   Project ID: " + newProject.get("id"));
            System.out.println("   Template: " + newProject.get("template"));
            
            String projectId = (String) newProject.get("id");
            
            // Get project details
            Map<String, Object> projectDetails = client.getProjects().get(projectId);
            System.out.println("✅ Retrieved project details");
            System.out.println("   Status: " + projectDetails.getOrDefault("status", "unknown"));
            System.out.println("   Created: " + projectDetails.getOrDefault("created_at", "unknown"));
            
            // Update project
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("description", "Updated description via Java SDK");
            
            Map<String, Object> updatedProject = client.getProjects().update(projectId, updateRequest);
            System.out.println("✅ Updated project description");
            
            // Get available templates
            List<Map<String, Object>> templates = client.getProjects().getTemplates();
            System.out.println("✅ Available templates: " + templates.size());
            for (int i = 0; i < Math.min(3, templates.size()); i++) {
                Map<String, Object> template = templates.get(i);
                System.out.println("   🎨 " + template.get("name") + " - " + template.get("description"));
            }
            
            // Clean up - delete the demo project
            System.out.println("\nCleaning up demo project...");
            client.getProjects().delete(projectId);
            System.out.println("✅ Deleted demo project");
            
        } catch (ValidationException e) {
            System.out.println("❌ Validation error: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ Project operation failed: " + e.getMessage());
        }
    }
    
    /**
     * Demonstrate advanced SDK features.
     */
    private static void demonstrateAdvancedFeatures(ZoptalClient client) {
        System.out.println("\n🚀 Advanced Features");
        System.out.println("=".repeat(50));
        
        try {
            // AI chat functionality
            System.out.println("Starting AI chat session...");
            Map<String, Object> chatRequest = new HashMap<>();
            chatRequest.put("message", "How do I optimize a slow JPA query in Spring Boot?");
            
            Map<String, Object> context = new HashMap<>();
            context.put("language", "java");
            context.put("framework", "spring-boot");
            context.put("database", "postgresql");
            chatRequest.put("context", context);
            
            Map<String, Object> chatResponse = client.getAI().chat(chatRequest);
            System.out.println("✅ AI chat response received");
            System.out.println("   Response length: " + chatResponse.get("response").toString().length());
            System.out.println("   Conversation ID: " + chatResponse.getOrDefault("conversation_id", "N/A"));
            
            // Continue the conversation
            Map<String, Object> followUpRequest = new HashMap<>();
            followUpRequest.put("message", "Can you show me a specific example with @Query annotation?");
            followUpRequest.put("conversation_id", chatResponse.get("conversation_id"));
            
            Map<String, Object> followUp = client.getAI().chat(followUpRequest);
            System.out.println("✅ Follow-up response received");
            
            // Code explanation
            System.out.println("\nExplaining complex code...");
            String complexCode = """
                @Service
                @Transactional
                public class UserService {
                    
                    @Autowired
                    private UserRepository userRepository;
                    
                    @Cacheable(value = "users", key = "#id")
                    public CompletableFuture<User> findUserAsync(Long id) {
                        return CompletableFuture.supplyAsync(() -> {
                            return userRepository.findById(id)
                                .orElseThrow(() -> new UserNotFoundException(id));
                        });
                    }
                }
                """;
            
            Map<String, Object> explainRequest = new HashMap<>();
            explainRequest.put("code", complexCode);
            explainRequest.put("language", "java");
            explainRequest.put("detail_level", "detailed");
            
            Map<String, Object> explanation = client.getAI().explainCode(explainRequest);
            System.out.println("✅ Code explanation generated");
            
            @SuppressWarnings("unchecked")
            List<Object> keyConcepts = (List<Object>) explanation.getOrDefault("key_concepts", List.of());
            System.out.println("   Key concepts: " + keyConcepts.size());
            
            // Test generation
            System.out.println("\nGenerating unit tests...");
            String testCode = """
                public class MathUtils {
                    public static double calculateDiscount(double price, double discountPercent) {
                        if (discountPercent > 100) {
                            throw new IllegalArgumentException("Discount cannot exceed 100%");
                        }
                        if (price < 0) {
                            throw new IllegalArgumentException("Price cannot be negative");
                        }
                        return price * (1 - discountPercent / 100);
                    }
                }
                """;
            
            Map<String, Object> testRequest = new HashMap<>();
            testRequest.put("code", testCode);
            testRequest.put("language", "java");
            testRequest.put("test_framework", "junit5");
            testRequest.put("coverage_target", 95);
            
            Map<String, Object> tests = client.getAI().generateTests(testRequest);
            System.out.println("✅ Unit tests generated");
            
            @SuppressWarnings("unchecked")
            List<Object> testCases = (List<Object>) tests.getOrDefault("test_cases", List.of());
            System.out.println("   Test cases: " + testCases.size());
            System.out.println("   Coverage estimate: " + tests.getOrDefault("coverage_estimate", 0) + "%");
            
        } catch (Exception e) {
            System.out.println("❌ Advanced feature failed: " + e.getMessage());
        }
    }
    
    /**
     * Demonstrate comprehensive error handling.
     */
    private static void demonstrateErrorHandling(ZoptalClient client) {
        System.out.println("\n⚠️  Error Handling");
        System.out.println("=".repeat(50));
        
        // Test different error scenarios
        TestScenario[] scenarios = {
            new TestScenario("Invalid project ID", () -> client.getProjects().get("invalid-id")),
            new TestScenario("Empty prompt", () -> {
                Map<String, Object> request = new HashMap<>();
                request.put("prompt", "");
                return client.getAI().generateCode(request);
            }),
            new TestScenario("Invalid template", () -> {
                Map<String, Object> request = new HashMap<>();
                request.put("name", "Test Project");
                request.put("template", "invalid-template");
                return client.getProjects().create(request);
            })
        };
        
        for (TestScenario scenario : scenarios) {
            System.out.println("\nTesting: " + scenario.description);
            try {
                scenario.operation.run();
                System.out.println("   ❌ Expected error but operation succeeded");
            } catch (ValidationException e) {
                System.out.println("   ✅ Caught validation error: " + e.getMessage());
            } catch (AuthenticationException e) {
                System.out.println("   ✅ Caught authentication error: " + e.getMessage());
            } catch (RateLimitException e) {
                System.out.println("   ✅ Caught rate limit error: " + e.getMessage());
            } catch (NotFoundException e) {
                System.out.println("   ✅ Caught not found error: " + e.getMessage());
            } catch (ZoptalException e) {
                System.out.println("   ✅ Caught Zoptal error: " + e.getMessage());
            } catch (Exception e) {
                System.out.println("   ⚠️  Caught unexpected error: " + e.getMessage());
            }
        }
    }
    
    /**
     * Helper class for error testing scenarios.
     */
    private static class TestScenario {
        final String description;
        final TestOperation operation;
        
        TestScenario(String description, TestOperation operation) {
            this.description = description;
            this.operation = operation;
        }
    }
    
    /**
     * Functional interface for test operations.
     */
    @FunctionalInterface
    private interface TestOperation {
        Object run() throws Exception;
    }
}