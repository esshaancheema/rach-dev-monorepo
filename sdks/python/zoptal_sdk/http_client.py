"""
HTTP Client for Zoptal SDK

This module provides the HTTP client with retry logic, rate limiting,
and error handling for the Zoptal API.
"""

import json
import time
import logging
from typing import Dict, Any, Optional, Union
from urllib.parse import urljoin
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

from .exceptions import (
    ZoptalException,
    AuthenticationError,
    APIError,
    RateLimitError,
    NotFoundError,
    ValidationError
)


class HTTPClient:
    """
    HTTP client with built-in retry logic and error handling.
    
    This client handles authentication, rate limiting, retries,
    and error response parsing for all API requests.
    """
    
    def __init__(
        self,
        base_url: str,
        api_key: str,
        timeout: int = 30,
        max_retries: int = 3,
        logger: Optional[logging.Logger] = None
    ):
        self.base_url = base_url
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
        self.logger = logger or logging.getLogger(__name__)
        
        # Create session with retry strategy
        self.session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=max_retries,
            status_forcelist=[429, 500, 502, 503, 504],
            method_whitelist=["HEAD", "GET", "PUT", "DELETE", "OPTIONS", "TRACE"],
            backoff_factor=1
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set default headers
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'zoptal-python-sdk/1.0.0',
            'Accept': 'application/json'
        })
    
    def _build_url(self, endpoint: str) -> str:
        """Build full URL from endpoint."""
        if endpoint.startswith('http'):
            return endpoint
        
        endpoint = endpoint.lstrip('/')
        return urljoin(f"{self.base_url}/", f"api/v1/{endpoint}")
    
    def _handle_response(self, response: requests.Response) -> Dict[str, Any]:
        """Handle HTTP response and raise appropriate exceptions."""
        try:
            # Log request details
            self.logger.debug(f"{response.request.method} {response.url} -> {response.status_code}")
            
            if response.status_code == 401:
                raise AuthenticationError("Invalid API key or expired token")
            elif response.status_code == 403:
                raise AuthenticationError("Insufficient permissions")
            elif response.status_code == 404:
                raise NotFoundError("Resource not found")
            elif response.status_code == 422:
                error_detail = "Validation failed"
                try:
                    error_data = response.json()
                    if 'detail' in error_data:
                        error_detail = error_data['detail']
                    elif 'message' in error_data:
                        error_detail = error_data['message']
                except:
                    pass
                raise ValidationError(error_detail)
            elif response.status_code == 429:
                # Extract rate limit information
                retry_after = response.headers.get('Retry-After', '60')
                raise RateLimitError(f"Rate limit exceeded. Retry after {retry_after} seconds")
            elif response.status_code >= 500:
                raise APIError(f"Server error: {response.status_code}")
            elif not response.ok:
                error_msg = f"HTTP {response.status_code}"
                try:
                    error_data = response.json()
                    if 'error' in error_data:
                        error_msg = error_data['error']
                    elif 'message' in error_data:
                        error_msg = error_data['message']
                except:
                    pass
                raise APIError(error_msg)
            
            # Parse JSON response
            if response.headers.get('content-type', '').startswith('application/json'):
                return response.json()
            else:
                return {'data': response.text}
                
        except (AuthenticationError, NotFoundError, ValidationError, RateLimitError, APIError):
            raise
        except requests.exceptions.RequestException as e:
            raise ZoptalException(f"Request failed: {str(e)}")
        except json.JSONDecodeError:
            raise ZoptalException("Invalid JSON response from server")
        except Exception as e:
            raise ZoptalException(f"Unexpected error: {str(e)}")
    
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make GET request."""
        url = self._build_url(endpoint)
        
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            return self._handle_response(response)
        except RateLimitError:
            # Handle rate limiting with exponential backoff
            time.sleep(2)
            response = self.session.get(url, params=params, timeout=self.timeout)
            return self._handle_response(response)
    
    def post(
        self, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        files: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make POST request."""
        url = self._build_url(endpoint)
        
        try:
            if files:
                # Remove content-type header for file uploads
                headers = self.session.headers.copy()
                headers.pop('Content-Type', None)
                response = self.session.post(
                    url, 
                    data=data, 
                    files=files, 
                    headers=headers,
                    timeout=self.timeout
                )
            else:
                response = self.session.post(
                    url, 
                    json=data, 
                    timeout=self.timeout
                )
            
            return self._handle_response(response)
        except RateLimitError:
            time.sleep(2)
            if files:
                headers = self.session.headers.copy()
                headers.pop('Content-Type', None)
                response = self.session.post(
                    url, 
                    data=data, 
                    files=files, 
                    headers=headers,
                    timeout=self.timeout
                )
            else:
                response = self.session.post(url, json=data, timeout=self.timeout)
            return self._handle_response(response)
    
    def put(self, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make PUT request."""
        url = self._build_url(endpoint)
        
        try:
            response = self.session.put(url, json=data, timeout=self.timeout)
            return self._handle_response(response)
        except RateLimitError:
            time.sleep(2)
            response = self.session.put(url, json=data, timeout=self.timeout)
            return self._handle_response(response)
    
    def patch(self, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make PATCH request."""
        url = self._build_url(endpoint)
        
        try:
            response = self.session.patch(url, json=data, timeout=self.timeout)
            return self._handle_response(response)
        except RateLimitError:
            time.sleep(2)
            response = self.session.patch(url, json=data, timeout=self.timeout)
            return self._handle_response(response)
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        """Make DELETE request."""
        url = self._build_url(endpoint)
        
        try:
            response = self.session.delete(url, timeout=self.timeout)
            return self._handle_response(response)
        except RateLimitError:
            time.sleep(2)
            response = self.session.delete(url, timeout=self.timeout)
            return self._handle_response(response)
    
    def close(self):
        """Close the HTTP session."""
        self.session.close()