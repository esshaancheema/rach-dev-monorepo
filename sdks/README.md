# Zoptal Platform SDKs

Official Software Development Kits (SDKs) for the Zoptal AI-powered development platform. These SDKs provide easy-to-use interfaces for integrating with all Zoptal services.

## 🚀 Available SDKs

| Language | Status | Version | Documentation | Package Manager |
|----------|--------|---------|---------------|----------------|
| **Python** | ✅ Stable | 1.0.0 | [Docs](python/README.md) | `pip install zoptal-sdk` |
| **Java** | ✅ Stable | 1.0.0 | [Docs](java/README.md) | Maven Central |
| **Go** | ✅ Stable | 1.0.0 | [Docs](go/README.md) | `go get github.com/zoptal/zoptal-go-sdk` |
| **JavaScript** | 🔄 Coming Soon | - | - | npm |
| **C#** | 📋 Planned | - | - | NuGet |
| **PHP** | 📋 Planned | - | - | Composer |

## 🌟 Features

All SDKs provide comprehensive access to Zoptal's features:

### 🤖 AI Services
- **Code Generation** - Generate code from natural language
- **Code Analysis** - Review and improve existing code
- **Code Refactoring** - Modernize and optimize code
- **Test Generation** - Automatic unit test creation
- **AI Chat** - Interactive AI assistance
- **Code Explanation** - Understand complex code

### 📁 Project Management
- **Project CRUD** - Create, read, update, delete projects
- **Template Management** - Use and create project templates
- **Collaboration** - Multi-user project access
- **Deployment** - One-click deployment to various platforms
- **Version Control** - Git integration and management

### 👥 Collaboration
- **Real-time Editing** - Live collaborative coding
- **Comments & Reviews** - Code review workflows
- **Team Management** - User roles and permissions
- **Activity Tracking** - Change logs and notifications

### 📂 File Management
- **File Operations** - Upload, download, organize files
- **Code Editing** - Syntax highlighting and completion
- **Asset Management** - Images, documents, media files
- **Search** - Full-text search across projects

## 🔧 Quick Start

### Python
```python
from zoptal_sdk import ZoptalClient

# Initialize client
client = ZoptalClient("your-api-key")

# Generate code with AI
result = client.ai.generate_code(
    prompt="Create a REST API endpoint for user authentication",
    language="python",
    framework="fastapi"
)

print(result['code'])
```

### Java
```java
import com.zoptal.sdk.ZoptalClient;
import com.zoptal.sdk.ai.CodeGenerationRequest;

// Initialize client
ZoptalClient client = new ZoptalClient("your-api-key");

// Generate code with AI
CodeGenerationRequest request = new CodeGenerationRequest()
    .setPrompt("Create a REST API endpoint for user authentication")
    .setLanguage("java")
    .setFramework("spring-boot");

Map<String, Object> result = client.getAI().generateCode(request);
System.out.println(result.get("code"));
```

### Go
```go
package main

import (
    "context"
    "fmt"
    "log"
    
    "github.com/zoptal/zoptal-go-sdk"
)

func main() {
    // Initialize client
    client := zoptal.NewClient("your-api-key")
    defer client.Close()
    
    // Generate code with AI
    result, err := client.AI.GenerateCode(context.Background(), &zoptal.CodeGenerationRequest{
        Prompt:    "Create a REST API endpoint for user authentication",
        Language:  "go",
        Framework: "gin",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println(result.Code)
}
```

## 📖 Documentation

### General Documentation
- **[API Reference](https://docs.zoptal.com/api)** - Complete API documentation
- **[Authentication Guide](https://docs.zoptal.com/auth)** - API key setup and authentication
- **[Rate Limits](https://docs.zoptal.com/rate-limits)** - Usage limits and best practices
- **[Webhooks](https://docs.zoptal.com/webhooks)** - Real-time event notifications

### SDK-Specific Guides
- **[Python SDK Documentation](python/README.md)** - Installation, usage, examples
- **[Java SDK Documentation](java/README.md)** - Maven setup, Spring integration
- **[Go SDK Documentation](go/README.md)** - Modules, context usage, examples

## 🔐 Authentication

All SDKs require a Zoptal API key for authentication:

1. **Get API Key**: Visit [Zoptal Dashboard](https://zoptal.com/dashboard) → Settings → API Keys
2. **Environment Variable** (Recommended):
   ```bash
   export ZOPTAL_API_KEY="your-api-key-here"
   ```
3. **Direct Initialization**:
   ```python
   client = ZoptalClient("your-api-key")
   ```

### Security Best Practices
- ✅ Store API keys in environment variables
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly
- ❌ Never commit API keys to version control
- ❌ Don't hardcode keys in client-side code

## 🏗️ Architecture

All SDKs follow consistent architectural patterns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your App      │────│   Zoptal SDK    │────│   Zoptal API    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼────┐
            │AI Service │ │Project│ │ File   │
            │           │ │Service│ │Service │
            └───────────┘ └───────┘ └────────┘
```

### Key Components
- **HTTP Client** - Handles requests, retries, rate limiting
- **Service Managers** - Organize functionality by domain
- **Error Handling** - Consistent error types and messages
- **Authentication** - Automatic token management
- **Logging** - Configurable debug and info logging

## 📊 Error Handling

All SDKs provide consistent error handling:

### Error Types
- `AuthenticationError` - Invalid or expired API key
- `ValidationError` - Invalid request parameters
- `RateLimitError` - API rate limits exceeded
- `NotFoundError` - Resource doesn't exist
- `APIError` - General API errors
- `NetworkError` - Connection issues

### Example Error Handling

**Python:**
```python
from zoptal_sdk import ZoptalClient, AuthenticationError, RateLimitError

try:
    client = ZoptalClient("invalid-key")
    result = client.ai.generate_code("Create a function")
except AuthenticationError:
    print("Invalid API key")
except RateLimitError as e:
    print(f"Rate limited: {e.message}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

**Java:**
```java
try {
    ZoptalClient client = new ZoptalClient("invalid-key");
    Map<String, Object> result = client.getAI().generateCode(request);
} catch (AuthenticationException e) {
    System.err.println("Invalid API key");
} catch (RateLimitException e) {
    System.err.println("Rate limited: " + e.getMessage());
} catch (ZoptalException e) {
    System.err.println("Error: " + e.getMessage());
}
```

**Go:**
```go
client := zoptal.NewClient("invalid-key")
result, err := client.AI.GenerateCode(ctx, request)
if err != nil {
    switch {
    case zoptal.IsAuthenticationError(err):
        log.Println("Invalid API key")
    case zoptal.IsRateLimitError(err):
        log.Printf("Rate limited: %v", err)
    default:
        log.Printf("Error: %v", err)
    }
}
```

## 🧪 Testing

All SDKs include comprehensive test suites:

### Running Tests

**Python:**
```bash
cd python/
pip install -e ".[dev]"
pytest tests/ -v --cov=zoptal_sdk
```

**Java:**
```bash
cd java/
mvn test
mvn verify  # includes integration tests
```

**Go:**
```bash
cd go/
go test ./... -v
go test ./... -race -coverprofile=coverage.out
```

### Test Coverage
- **Unit Tests** - All core functionality
- **Integration Tests** - Real API interactions
- **Error Handling** - All error scenarios
- **Performance Tests** - Load and stress testing

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Test Zoptal Integration
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install zoptal-sdk pytest
      - name: Run tests
        env:
          ZOPTAL_API_KEY: ${{ secrets.ZOPTAL_API_KEY }}
        run: pytest tests/
```

### Environment Variables
```bash
# Required
ZOPTAL_API_KEY=your-api-key

# Optional
ZOPTAL_BASE_URL=https://api.zoptal.com  # Custom API endpoint
ZOPTAL_TIMEOUT=30                       # Request timeout (seconds)
ZOPTAL_MAX_RETRIES=3                   # Maximum retry attempts
ZOPTAL_DEBUG=false                     # Enable debug logging
```

## 📈 Performance

### Benchmarks
| Operation | Python | Java | Go |
|-----------|--------|------|----|
| Simple API Call | ~100ms | ~80ms | ~60ms |
| Code Generation | ~2-5s | ~2-4s | ~2-4s |
| File Upload (1MB) | ~500ms | ~400ms | ~300ms |
| Batch Operations | ~1-3s | ~800ms-2s | ~600ms-1.5s |

### Optimization Tips
- **Connection Pooling** - Reuse HTTP connections
- **Batch Requests** - Combine multiple operations
- **Caching** - Cache frequently accessed data
- **Async Operations** - Use async/await patterns where available
- **Rate Limiting** - Implement client-side rate limiting

## 🤝 Contributing

We welcome contributions to all SDKs! Here's how to get started:

### Development Setup
1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/zoptal-sdks.git
   cd zoptal-sdks
   ```
3. **Choose your SDK**:
   ```bash
   cd python/  # or java/ or go/
   ```
4. **Install dependencies** (see individual SDK README files)
5. **Run tests** to ensure everything works
6. **Make your changes**
7. **Add tests** for new functionality
8. **Submit a pull request**

### Contribution Guidelines
- **Code Style** - Follow language-specific conventions
- **Documentation** - Update docs for all changes
- **Tests** - Maintain 95%+ test coverage
- **Commit Messages** - Use conventional commit format
- **Breaking Changes** - Follow semantic versioning

### Areas for Contribution
- 🐛 Bug fixes and improvements
- 📚 Documentation enhancements
- ✨ New feature implementations
- 🧪 Additional test coverage
- 🌐 New language SDKs
- 📊 Performance optimizations

## 📞 Support

### Getting Help
- **📖 Documentation** - Check SDK-specific docs first
- **🐛 Bug Reports** - [GitHub Issues](https://github.com/zoptal/zoptal-sdks/issues)
- **💬 Community** - [Discord Server](https://discord.gg/zoptal)
- **📧 Direct Support** - sdk@zoptal.com

### Support Levels
- **Community** - Free support via GitHub/Discord
- **Business** - Priority email support
- **Enterprise** - Dedicated support team + SLA

## 📄 License

All Zoptal SDKs are released under the [MIT License](LICENSE).

## 🗺️ Roadmap

### Q1 2024
- ✅ Python SDK v1.0
- ✅ Java SDK v1.0  
- ✅ Go SDK v1.0
- 🔄 JavaScript/TypeScript SDK

### Q2 2024
- 📋 C# .NET SDK
- 📋 PHP SDK
- 📋 Ruby SDK
- 📋 Rust SDK

### Q3 2024
- 📋 Swift SDK (iOS/macOS)
- 📋 Kotlin SDK (Android)
- 📋 Dart SDK (Flutter)
- 📋 GraphQL support

### Q4 2024
- 📋 CLI tools
- 📋 IDE extensions
- 📋 Terraform provider
- 📋 Helm charts

---

**Ready to build with AI?** Choose your preferred SDK and start coding! 🚀

**Questions?** Check our [FAQ](https://docs.zoptal.com/faq) or join our [community](https://discord.gg/zoptal).