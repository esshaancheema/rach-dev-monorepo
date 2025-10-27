"""
AI Assistant Module

This module provides functionality for interacting with Zoptal's AI services
including code generation, analysis, and chat functionality.
"""

from typing import Dict, List, Any, Optional, Generator
from .exceptions import AIError, ValidationError


class AIManager:
    """
    Manager for AI-related operations.
    
    This class provides methods to interact with Zoptal's AI services
    for code generation, analysis, and chat functionality.
    """
    
    def __init__(self, http_client):
        self.http_client = http_client
    
    def generate_code(
        self,
        prompt: str,
        language: str = "javascript",
        framework: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        model: str = "gpt-4"
    ) -> Dict[str, Any]:
        """
        Generate code using AI based on a natural language prompt.
        
        Args:
            prompt (str): Natural language description of the code to generate
            language (str): Programming language (default: 'javascript')
            framework (str, optional): Framework to use (e.g., 'react', 'vue', 'express')
            context (dict, optional): Additional context like existing code, file structure
            model (str): AI model to use ('gpt-4', 'claude', 'codex')
        
        Returns:
            Dict containing:
            - code: Generated code
            - explanation: Explanation of the generated code
            - language: Programming language used
            - suggestions: Additional suggestions
            - tests: Generated test cases (if applicable)
            
        Raises:
            ValidationError: If required parameters are missing
            AIError: If code generation fails
        """
        if not prompt or not prompt.strip():
            raise ValidationError("Prompt is required")
        
        if language not in ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'php', 'ruby']:
            raise ValidationError(f"Unsupported language: {language}")
        
        if model not in ['gpt-4', 'claude', 'codex']:
            raise ValidationError(f"Unsupported model: {model}")
        
        data = {
            'prompt': prompt.strip(),
            'language': language,
            'model': model
        }
        
        if framework:
            data['framework'] = framework
        if context:
            data['context'] = context
        
        try:
            response = self.http_client.post('/ai/generate-code', data=data)
            return response
        except Exception as e:
            raise AIError(f"Failed to generate code: {str(e)}")
    
    def analyze_code(
        self,
        code: str,
        language: str,
        analysis_type: str = "comprehensive",
        include_suggestions: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze existing code for issues, improvements, and suggestions.
        
        Args:
            code (str): The code to analyze
            language (str): Programming language of the code
            analysis_type (str): Type of analysis ('security', 'performance', 'quality', 'comprehensive')
            include_suggestions (bool): Whether to include improvement suggestions
        
        Returns:
            Dict containing:
            - issues: List of identified issues
            - suggestions: Improvement suggestions
            - metrics: Code quality metrics
            - security_warnings: Security-related warnings
            - performance_tips: Performance optimization tips
            
        Raises:
            ValidationError: If parameters are invalid
            AIError: If analysis fails
        """
        if not code or not code.strip():
            raise ValidationError("Code is required")
        
        if not language:
            raise ValidationError("Language is required")
        
        analysis_types = ['security', 'performance', 'quality', 'comprehensive']
        if analysis_type not in analysis_types:
            raise ValidationError(f"Analysis type must be one of: {analysis_types}")
        
        data = {
            'code': code,
            'language': language,
            'analysis_type': analysis_type,
            'include_suggestions': include_suggestions
        }
        
        try:
            response = self.http_client.post('/ai/analyze-code', data=data)
            return response
        except Exception as e:
            raise AIError(f"Failed to analyze code: {str(e)}")
    
    def refactor_code(
        self,
        code: str,
        language: str,
        refactor_type: str = "improve",
        target_pattern: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Refactor existing code for better quality, performance, or patterns.
        
        Args:
            code (str): The code to refactor
            language (str): Programming language of the code
            refactor_type (str): Type of refactoring ('improve', 'modernize', 'optimize', 'pattern')
            target_pattern (str, optional): Specific pattern to refactor to (e.g., 'hooks', 'async-await')
        
        Returns:
            Dict containing:
            - refactored_code: The refactored code
            - changes_made: List of changes made
            - explanation: Explanation of the refactoring
            - before_after: Comparison of before and after
            
        Raises:
            ValidationError: If parameters are invalid
            AIError: If refactoring fails
        """
        if not code or not code.strip():
            raise ValidationError("Code is required")
        
        if not language:
            raise ValidationError("Language is required")
        
        refactor_types = ['improve', 'modernize', 'optimize', 'pattern']
        if refactor_type not in refactor_types:
            raise ValidationError(f"Refactor type must be one of: {refactor_types}")
        
        data = {
            'code': code,
            'language': language,
            'refactor_type': refactor_type
        }
        
        if target_pattern:
            data['target_pattern'] = target_pattern
        
        try:
            response = self.http_client.post('/ai/refactor-code', data=data)
            return response
        except Exception as e:
            raise AIError(f"Failed to refactor code: {str(e)}")
    
    def generate_tests(
        self,
        code: str,
        language: str,
        test_framework: Optional[str] = None,
        coverage_target: int = 80
    ) -> Dict[str, Any]:
        """
        Generate unit tests for the provided code.
        
        Args:
            code (str): The code to generate tests for
            language (str): Programming language of the code
            test_framework (str, optional): Testing framework to use
            coverage_target (int): Target test coverage percentage
        
        Returns:
            Dict containing:
            - test_code: Generated test code
            - test_cases: List of test cases
            - coverage_estimate: Estimated coverage percentage
            - setup_instructions: Instructions for running tests
            
        Raises:
            ValidationError: If parameters are invalid
            AIError: If test generation fails
        """
        if not code or not code.strip():
            raise ValidationError("Code is required")
        
        if not language:
            raise ValidationError("Language is required")
        
        if coverage_target < 0 or coverage_target > 100:
            raise ValidationError("Coverage target must be between 0 and 100")
        
        data = {
            'code': code,
            'language': language,
            'coverage_target': coverage_target
        }
        
        if test_framework:
            data['test_framework'] = test_framework
        
        try:
            response = self.http_client.post('/ai/generate-tests', data=data)
            return response
        except Exception as e:
            raise AIError(f"Failed to generate tests: {str(e)}")
    
    def chat(
        self,
        message: str,
        conversation_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        model: str = "gpt-4"
    ) -> Dict[str, Any]:
        """
        Chat with the AI assistant.
        
        Args:
            message (str): Message to send to the AI
            conversation_id (str, optional): ID of existing conversation to continue
            context (dict, optional): Additional context for the conversation
            model (str): AI model to use for the conversation
        
        Returns:
            Dict containing:
            - response: AI response
            - conversation_id: ID of the conversation
            - suggestions: Follow-up suggestions
            - context: Updated context
            
        Raises:
            ValidationError: If message is empty
            AIError: If chat fails
        """
        if not message or not message.strip():
            raise ValidationError("Message is required")
        
        data = {
            'message': message.strip(),
            'model': model
        }
        
        if conversation_id:
            data['conversation_id'] = conversation_id
        if context:
            data['context'] = context
        
        try:
            response = self.http_client.post('/ai/chat', data=data)
            return response
        except Exception as e:
            raise AIError(f"Failed to chat with AI: {str(e)}")
    
    def explain_code(
        self,
        code: str,
        language: str,
        detail_level: str = "medium"
    ) -> Dict[str, Any]:
        """
        Get an explanation of what the provided code does.
        
        Args:
            code (str): The code to explain
            language (str): Programming language of the code
            detail_level (str): Level of detail ('basic', 'medium', 'detailed')
        
        Returns:
            Dict containing:
            - explanation: Plain English explanation of the code
            - key_concepts: Key programming concepts used
            - flow_description: Step-by-step flow description
            - potential_issues: Potential issues or concerns
            
        Raises:
            ValidationError: If parameters are invalid
            AIError: If explanation fails
        """
        if not code or not code.strip():
            raise ValidationError("Code is required")
        
        if not language:
            raise ValidationError("Language is required")
        
        if detail_level not in ['basic', 'medium', 'detailed']:
            raise ValidationError("Detail level must be 'basic', 'medium', or 'detailed'")
        
        data = {
            'code': code,
            'language': language,
            'detail_level': detail_level
        }
        
        try:
            response = self.http_client.post('/ai/explain-code', data=data)
            return response
        except Exception as e:
            raise AIError(f"Failed to explain code: {str(e)}")
    
    def stream_generation(
        self,
        prompt: str,
        language: str = "javascript",
        model: str = "gpt-4"
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Stream code generation in real-time.
        
        Args:
            prompt (str): Natural language description of the code to generate
            language (str): Programming language
            model (str): AI model to use
        
        Yields:
            Dict containing partial response chunks
            
        Raises:
            ValidationError: If parameters are invalid
            AIError: If streaming fails
        """
        if not prompt or not prompt.strip():
            raise ValidationError("Prompt is required")
        
        data = {
            'prompt': prompt.strip(),
            'language': language,
            'model': model,
            'stream': True
        }
        
        try:
            # Note: This would typically use Server-Sent Events or WebSocket
            # For now, we'll simulate with a regular POST request
            response = self.http_client.post('/ai/generate-code-stream', data=data)
            
            # In a real implementation, this would yield chunks as they arrive
            yield response
            
        except Exception as e:
            raise AIError(f"Failed to stream code generation: {str(e)}")
    
    def get_suggestions(
        self,
        partial_code: str,
        language: str,
        cursor_position: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get AI-powered code completion suggestions.
        
        Args:
            partial_code (str): Partial code being written
            language (str): Programming language
            cursor_position (int): Position of the cursor in the code
        
        Returns:
            List of suggestion objects containing:
            - text: Suggested completion text
            - description: Description of the suggestion
            - score: Confidence score (0-1)
            
        Raises:
            ValidationError: If parameters are invalid
            AIError: If getting suggestions fails
        """
        if not language:
            raise ValidationError("Language is required")
        
        data = {
            'partial_code': partial_code or "",
            'language': language,
            'cursor_position': cursor_position
        }
        
        try:
            response = self.http_client.post('/ai/suggestions', data=data)
            return response.get('suggestions', [])
        except Exception as e:
            raise AIError(f"Failed to get suggestions: {str(e)}")
    
    def get_models(self) -> List[Dict[str, Any]]:
        """
        Get list of available AI models.
        
        Returns:
            List of available AI models with their capabilities
            
        Raises:
            AIError: If request fails
        """
        try:
            response = self.http_client.get('/ai/models')
            return response.get('models', [])
        except Exception as e:
            raise AIError(f"Failed to get AI models: {str(e)}")