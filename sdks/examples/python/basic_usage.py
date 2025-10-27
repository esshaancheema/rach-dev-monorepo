#!/usr/bin/env python3
"""
Zoptal Python SDK - Basic Usage Examples

This script demonstrates basic usage of the Zoptal Python SDK including:
- Client initialization
- AI code generation
- Project management
- File operations
- Error handling

Requirements:
    pip install zoptal-sdk

Usage:
    export ZOPTAL_API_KEY="your-api-key"
    python basic_usage.py
"""

import os
import logging
from typing import Optional

from zoptal_sdk import ZoptalClient
from zoptal_sdk.exceptions import (
    AuthenticationError,
    RateLimitError,
    ValidationError,
    ZoptalException
)


def setup_logging():
    """Setup logging configuration."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )


def get_api_key() -> Optional[str]:
    """Get API key from environment variable."""
    api_key = os.getenv('ZOPTAL_API_KEY')
    if not api_key:
        print("❌ Please set ZOPTAL_API_KEY environment variable")
        print("   export ZOPTAL_API_KEY='your-api-key'")
        return None
    return api_key


def demonstrate_client_initialization():
    """Demonstrate client initialization and configuration."""
    print("\n🔧 Client Initialization")
    print("=" * 50)
    
    api_key = get_api_key()
    if not api_key:
        return None
    
    # Basic client initialization
    client = ZoptalClient(api_key)
    print(f"✅ Client initialized: {client}")
    print(f"   API Key: {client.get_api_key()}")
    print(f"   Base URL: {client.get_base_url()}")
    
    # Advanced client with custom settings
    advanced_client = ZoptalClient(
        api_key=api_key,
        base_url="https://api.zoptal.com",
        timeout=60,
        max_retries=5,
        debug=True
    )
    print(f"✅ Advanced client: {advanced_client}")
    
    return client


def demonstrate_health_check(client: ZoptalClient):
    """Demonstrate API health check."""
    print("\n❤️  Health Check")
    print("=" * 50)
    
    try:
        health = client.health_check()
        print("✅ API is healthy!")
        print(f"   Status: {health.get('status', 'unknown')}")
        print(f"   Timestamp: {health.get('timestamp', 'unknown')}")
        print(f"   Version: {health.get('version', 'unknown')}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")


def demonstrate_user_info(client: ZoptalClient):
    """Demonstrate getting user information."""
    print("\n👤 User Information")
    print("=" * 50)
    
    try:
        user_info = client.get_user_info()
        print("✅ User information retrieved!")
        print(f"   Name: {user_info.get('name', 'N/A')}")
        print(f"   Email: {user_info.get('email', 'N/A')}")
        print(f"   Plan: {user_info.get('plan', 'N/A')}")
        print(f"   Account ID: {user_info.get('id', 'N/A')}")
        
        # Get usage statistics
        usage = client.get_usage_stats()
        print("\n📊 Usage Statistics:")
        print(f"   API Requests: {usage.get('api_requests', 0)}")
        print(f"   AI Tokens: {usage.get('ai_tokens', 0)}")
        print(f"   Storage Used: {usage.get('storage_used', 0)} MB")
        
    except AuthenticationError:
        print("❌ Authentication failed - check your API key")
    except Exception as e:
        print(f"❌ Failed to get user info: {e}")


def demonstrate_ai_features(client: ZoptalClient):
    """Demonstrate AI code generation and analysis features."""
    print("\n🤖 AI Features")
    print("=" * 50)
    
    try:
        # Simple code generation
        print("Generating a simple function...")
        result = client.ai.generate_code(
            prompt="Create a Python function that calculates the factorial of a number",
            language="python"
        )
        print("✅ Code generated successfully!")
        print("Generated code:")
        print("-" * 40)
        print(result['code'])
        print("-" * 40)
        print(f"Explanation: {result.get('explanation', 'No explanation provided')}")
        
        # Advanced code generation with context
        print("\nGenerating a React component...")
        react_result = client.ai.generate_code(
            prompt="Create a React component for a user profile card with name, email, avatar, and follow button",
            language="javascript",
            framework="react",
            context={
                "project_type": "web_app",
                "existing_components": ["Button", "Avatar"],
                "style_guide": "modern, clean design"
            }
        )
        print("✅ React component generated!")
        print(f"Component size: {len(react_result['code'])} characters")
        
        # Code analysis
        print("\nAnalyzing code quality...")
        sample_code = """
def process_data(data):
    result = []
    for i in range(len(data)):
        if data[i] > 0:
            result.append(data[i] * 2)
    return result
"""
        
        analysis = client.ai.analyze_code(
            code=sample_code,
            language="python",
            analysis_type="comprehensive"
        )
        print("✅ Code analysis completed!")
        print(f"Issues found: {len(analysis.get('issues', []))}")
        print(f"Suggestions: {len(analysis.get('suggestions', []))}")
        
        if analysis.get('suggestions'):
            print("Top suggestion:")
            print(f"  - {analysis['suggestions'][0]['description']}")
        
    except RateLimitError as e:
        print(f"❌ Rate limit exceeded: {e}")
        print("   Please wait before making more requests")
    except ValidationError as e:
        print(f"❌ Validation error: {e}")
    except Exception as e:
        print(f"❌ AI operation failed: {e}")


def demonstrate_project_management(client: ZoptalClient):
    """Demonstrate project management features."""
    print("\n📁 Project Management")
    print("=" * 50)
    
    try:
        # List existing projects
        projects = client.projects.list(limit=5)
        print(f"✅ Found {projects.get('total', 0)} projects")
        
        for project in projects.get('projects', [])[:3]:
            print(f"   📂 {project['name']} (ID: {project['id']})")
        
        # Create a new project
        print("\nCreating a new project...")
        new_project = client.projects.create(
            name="SDK Demo Project",
            template="react",
            description="Project created via Python SDK demo",
            visibility="private"
        )
        print(f"✅ Created project: {new_project['name']}")
        print(f"   Project ID: {new_project['id']}")
        print(f"   Template: {new_project['template']}")
        
        project_id = new_project['id']
        
        # Get project details
        project_details = client.projects.get(project_id)
        print(f"✅ Retrieved project details")
        print(f"   Status: {project_details.get('status', 'unknown')}")
        print(f"   Created: {project_details.get('created_at', 'unknown')}")
        
        # Update project
        updated_project = client.projects.update(
            project_id,
            description="Updated description via SDK"
        )
        print(f"✅ Updated project description")
        
        # Get available templates
        templates = client.projects.get_templates()
        print(f"✅ Available templates: {len(templates)}")
        for template in templates[:3]:
            print(f"   🎨 {template['name']} - {template['description']}")
        
        # Clean up - delete the demo project
        print(f"\nCleaning up demo project...")
        client.projects.delete(project_id)
        print(f"✅ Deleted demo project")
        
    except ValidationError as e:
        print(f"❌ Validation error: {e}")
    except Exception as e:
        print(f"❌ Project operation failed: {e}")


def demonstrate_error_handling(client: ZoptalClient):
    """Demonstrate comprehensive error handling."""
    print("\n⚠️  Error Handling")
    print("=" * 50)
    
    # Test different error scenarios
    error_scenarios = [
        ("Invalid project ID", lambda: client.projects.get("invalid-id")),
        ("Empty prompt", lambda: client.ai.generate_code("")),
        ("Invalid template", lambda: client.projects.create("Test", template="invalid")),
    ]
    
    for description, operation in error_scenarios:
        print(f"\nTesting: {description}")
        try:
            operation()
            print("   ❌ Expected error but operation succeeded")
        except ValidationError as e:
            print(f"   ✅ Caught validation error: {e}")
        except AuthenticationError as e:
            print(f"   ✅ Caught authentication error: {e}")
        except RateLimitError as e:
            print(f"   ✅ Caught rate limit error: {e}")
        except ZoptalException as e:
            print(f"   ✅ Caught Zoptal error: {e}")
        except Exception as e:
            print(f"   ⚠️  Caught unexpected error: {e}")


def demonstrate_advanced_features(client: ZoptalClient):
    """Demonstrate advanced SDK features."""
    print("\n🚀 Advanced Features")
    print("=" * 50)
    
    try:
        # AI chat functionality
        print("Starting AI chat session...")
        chat_response = client.ai.chat(
            message="How do I optimize a slow database query?",
            context={"language": "sql", "database": "postgresql"}
        )
        print("✅ AI chat response received")
        print(f"   Response length: {len(chat_response.get('response', ''))}")
        print(f"   Conversation ID: {chat_response.get('conversation_id', 'N/A')}")
        
        # Continue the conversation
        follow_up = client.ai.chat(
            message="Can you show me an example?",
            conversation_id=chat_response.get('conversation_id')
        )
        print("✅ Follow-up response received")
        
        # Code explanation
        print("\nExplaining complex code...")
        explanation = client.ai.explain_code(
            code="""
import asyncio
from typing import List, Dict
async def fetch_data(urls: List[str]) -> Dict[str, str]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return {url: result for url, result in zip(urls, results)}
            """,
            language="python",
            detail_level="detailed"
        )
        print("✅ Code explanation generated")
        print(f"   Key concepts: {len(explanation.get('key_concepts', []))}")
        
        # Test generation
        print("\nGenerating unit tests...")
        test_code = """
def calculate_discount(price, discount_percent):
    if discount_percent > 100:
        raise ValueError("Discount cannot exceed 100%")
    return price * (1 - discount_percent / 100)
        """
        
        tests = client.ai.generate_tests(
            code=test_code,
            language="python",
            test_framework="pytest",
            coverage_target=95
        )
        print("✅ Unit tests generated")
        print(f"   Test cases: {len(tests.get('test_cases', []))}")
        print(f"   Coverage estimate: {tests.get('coverage_estimate', 0)}%")
        
    except Exception as e:
        print(f"❌ Advanced feature failed: {e}")


def main():
    """Main demonstration function."""
    print("🎉 Zoptal Python SDK - Basic Usage Examples")
    print("=" * 60)
    
    setup_logging()
    
    # Initialize client
    client = demonstrate_client_initialization()
    if not client:
        return
    
    try:
        # Use context manager for automatic cleanup
        with client:
            # Run demonstrations
            demonstrate_health_check(client)
            demonstrate_user_info(client)
            demonstrate_ai_features(client)
            demonstrate_project_management(client)
            demonstrate_advanced_features(client)
            demonstrate_error_handling(client)
            
        print("\n🎉 All demonstrations completed successfully!")
        print("\n📚 Next Steps:")
        print("   - Explore the full API documentation")
        print("   - Check out advanced examples")
        print("   - Join our community Discord")
        print("   - Build something awesome!")
        
    except KeyboardInterrupt:
        print("\n👋 Demo interrupted by user")
    except Exception as e:
        print(f"\n❌ Demo failed with unexpected error: {e}")
        logging.exception("Unexpected error during demo")
    finally:
        print("\n🔚 Demo finished")


if __name__ == "__main__":
    main()