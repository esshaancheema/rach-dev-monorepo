"""
Zoptal Python SDK

A comprehensive Python SDK for the Zoptal AI-powered development platform.

Author: Zoptal Development Team
Version: 1.0.0
License: MIT
"""

from .client import ZoptalClient
from .auth import AuthManager
from .projects import ProjectManager
from .ai import AIManager
from .collaboration import CollaborationManager
from .files import FileManager
from .exceptions import (
    ZoptalException,
    AuthenticationError,
    APIError,
    RateLimitError,
    NotFoundError,
    ValidationError
)

__version__ = "1.0.0"
__author__ = "Zoptal Development Team"
__email__ = "sdk@zoptal.com"
__license__ = "MIT"

__all__ = [
    'ZoptalClient',
    'AuthManager',
    'ProjectManager',
    'AIManager',
    'CollaborationManager',
    'FileManager',
    'ZoptalException',
    'AuthenticationError',
    'APIError',
    'RateLimitError',
    'NotFoundError',
    'ValidationError'
]