"""
Zoptal SDK Exceptions

This module defines all custom exceptions used by the Zoptal SDK.
"""


class ZoptalException(Exception):
    """Base exception for all Zoptal SDK errors."""
    
    def __init__(self, message: str, error_code: str = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
    
    def __str__(self):
        if self.error_code:
            return f"[{self.error_code}] {self.message}"
        return self.message


class AuthenticationError(ZoptalException):
    """Raised when authentication fails."""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, "AUTH_ERROR")


class APIError(ZoptalException):
    """Raised when the API returns an error response."""
    
    def __init__(self, message: str, status_code: int = None):
        super().__init__(message, "API_ERROR")
        self.status_code = status_code


class RateLimitError(ZoptalException):
    """Raised when rate limits are exceeded."""
    
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(message, "RATE_LIMIT")


class NotFoundError(ZoptalException):
    """Raised when a requested resource is not found."""
    
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, "NOT_FOUND")


class ValidationError(ZoptalException):
    """Raised when request validation fails."""
    
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, "VALIDATION_ERROR")


class ProjectError(ZoptalException):
    """Raised for project-related errors."""
    
    def __init__(self, message: str):
        super().__init__(message, "PROJECT_ERROR")


class FileError(ZoptalException):
    """Raised for file operation errors."""
    
    def __init__(self, message: str):
        super().__init__(message, "FILE_ERROR")


class AIError(ZoptalException):
    """Raised for AI service errors."""
    
    def __init__(self, message: str):
        super().__init__(message, "AI_ERROR")


class CollaborationError(ZoptalException):
    """Raised for collaboration feature errors."""
    
    def __init__(self, message: str):
        super().__init__(message, "COLLABORATION_ERROR")