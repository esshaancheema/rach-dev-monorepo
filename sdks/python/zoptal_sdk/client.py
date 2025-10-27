"""
Main Zoptal SDK Client

This module provides the main client class for interacting with the Zoptal API.
"""

import logging
from typing import Optional, Dict, Any
from urllib.parse import urljoin

from .auth import AuthManager
from .projects import ProjectManager
from .ai import AIManager
from .collaboration import CollaborationManager
from .files import FileManager
from .http_client import HTTPClient
from .exceptions import ZoptalException, AuthenticationError


class ZoptalClient:
    """
    Main client for interacting with the Zoptal API.
    
    This client provides access to all Zoptal services including projects,
    AI assistance, collaboration features, and file management.
    
    Args:
        api_key (str): Your Zoptal API key
        base_url (str, optional): Base URL for the Zoptal API. 
            Defaults to 'https://api.zoptal.com'
        timeout (int, optional): Request timeout in seconds. Defaults to 30
        max_retries (int, optional): Maximum number of retries for failed requests. 
            Defaults to 3
        debug (bool, optional): Enable debug logging. Defaults to False
    
    Example:
        >>> client = ZoptalClient(api_key="your-api-key")
        >>> projects = client.projects.list()
        >>> print(f"Found {len(projects)} projects")
    """
    
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.zoptal.com",
        timeout: int = 30,
        max_retries: int = 3,
        debug: bool = False
    ):
        if not api_key:
            raise AuthenticationError("API key is required")
        
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.max_retries = max_retries
        
        # Configure logging
        if debug:
            logging.basicConfig(level=logging.DEBUG)
            
        self.logger = logging.getLogger(__name__)
        
        # Initialize HTTP client
        self.http_client = HTTPClient(
            base_url=self.base_url,
            api_key=self.api_key,
            timeout=self.timeout,
            max_retries=self.max_retries,
            logger=self.logger
        )
        
        # Initialize service managers
        self.auth = AuthManager(self.http_client)
        self.projects = ProjectManager(self.http_client)
        self.ai = AIManager(self.http_client)
        self.collaboration = CollaborationManager(self.http_client)
        self.files = FileManager(self.http_client)
        
        self.logger.info("Zoptal SDK client initialized")
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check the health status of the Zoptal API.
        
        Returns:
            Dict containing health status information
            
        Raises:
            ZoptalException: If the health check fails
        """
        try:
            response = self.http_client.get("/health")
            return response
        except Exception as e:
            raise ZoptalException(f"Health check failed: {str(e)}")
    
    def get_user_info(self) -> Dict[str, Any]:
        """
        Get information about the authenticated user.
        
        Returns:
            Dict containing user information
            
        Raises:
            AuthenticationError: If authentication fails
            ZoptalException: If the request fails
        """
        try:
            response = self.http_client.get("/user/profile")
            return response
        except Exception as e:
            if "401" in str(e) or "unauthorized" in str(e).lower():
                raise AuthenticationError("Invalid API key or expired token")
            raise ZoptalException(f"Failed to get user info: {str(e)}")
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """
        Get usage statistics for the authenticated user.
        
        Returns:
            Dict containing usage statistics including:
            - API requests made
            - AI tokens consumed
            - Storage used
            - Collaboration sessions
            
        Raises:
            ZoptalException: If the request fails
        """
        try:
            response = self.http_client.get("/user/usage")
            return response
        except Exception as e:
            raise ZoptalException(f"Failed to get usage stats: {str(e)}")
    
    def close(self):
        """
        Clean up resources and close connections.
        
        This should be called when you're done using the client,
        especially in long-running applications.
        """
        if hasattr(self.http_client, 'close'):
            self.http_client.close()
        self.logger.info("Zoptal SDK client closed")
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
    
    def __repr__(self) -> str:
        """String representation of the client."""
        return f"ZoptalClient(base_url='{self.base_url}', timeout={self.timeout})"