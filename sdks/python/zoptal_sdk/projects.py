"""
Project Management Module

This module provides functionality for managing Zoptal projects including
creation, listing, updating, and deletion.
"""

from typing import Dict, List, Any, Optional
from .exceptions import ProjectError, ValidationError


class ProjectManager:
    """
    Manager for project-related operations.
    
    This class provides methods to create, list, update, and delete projects
    in the Zoptal platform.
    """
    
    def __init__(self, http_client):
        self.http_client = http_client
    
    def list(
        self, 
        page: int = 1, 
        limit: int = 20, 
        search: Optional[str] = None,
        status: Optional[str] = None,
        template: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        List all projects for the authenticated user.
        
        Args:
            page (int): Page number for pagination (default: 1)
            limit (int): Number of projects per page (default: 20, max: 100)
            search (str, optional): Search term to filter projects by name/description
            status (str, optional): Filter by project status ('active', 'archived', 'deleted')
            template (str, optional): Filter by project template
        
        Returns:
            Dict containing:
            - projects: List of project objects
            - total: Total number of projects
            - page: Current page number
            - pages: Total number of pages
            
        Raises:
            ProjectError: If the request fails
        """
        params = {
            'page': page,
            'limit': min(limit, 100)  # Enforce maximum limit
        }
        
        if search:
            params['search'] = search
        if status:
            params['status'] = status
        if template:
            params['template'] = template
        
        try:
            response = self.http_client.get('/projects', params=params)
            return response
        except Exception as e:
            raise ProjectError(f"Failed to list projects: {str(e)}")
    
    def get(self, project_id: str) -> Dict[str, Any]:
        """
        Get details of a specific project.
        
        Args:
            project_id (str): The unique identifier of the project
        
        Returns:
            Dict containing project details including:
            - id: Project ID
            - name: Project name
            - description: Project description
            - template: Template used
            - status: Current status
            - created_at: Creation timestamp
            - updated_at: Last update timestamp
            - collaborators: List of collaborators
            - settings: Project settings
            
        Raises:
            ProjectError: If the project doesn't exist or request fails
        """
        if not project_id:
            raise ValidationError("Project ID is required")
        
        try:
            response = self.http_client.get(f'/projects/{project_id}')
            return response
        except Exception as e:
            raise ProjectError(f"Failed to get project {project_id}: {str(e)}")
    
    def create(
        self,
        name: str,
        template: str = "blank",
        description: str = "",
        visibility: str = "private",
        settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a new project.
        
        Args:
            name (str): Name of the project (required)
            template (str): Template to use ('blank', 'react', 'node', 'python', etc.)
            description (str): Project description
            visibility (str): Project visibility ('private', 'public', 'team')
            settings (dict, optional): Additional project settings
        
        Returns:
            Dict containing the created project details
            
        Raises:
            ValidationError: If required parameters are missing or invalid
            ProjectError: If project creation fails
        """
        if not name or not name.strip():
            raise ValidationError("Project name is required")
        
        if visibility not in ['private', 'public', 'team']:
            raise ValidationError("Visibility must be 'private', 'public', or 'team'")
        
        data = {
            'name': name.strip(),
            'template': template,
            'description': description,
            'visibility': visibility
        }
        
        if settings:
            data['settings'] = settings
        
        try:
            response = self.http_client.post('/projects', data=data)
            return response
        except Exception as e:
            raise ProjectError(f"Failed to create project: {str(e)}")
    
    def update(
        self,
        project_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        visibility: Optional[str] = None,
        settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Update an existing project.
        
        Args:
            project_id (str): The unique identifier of the project
            name (str, optional): New project name
            description (str, optional): New project description
            visibility (str, optional): New project visibility
            settings (dict, optional): Updated project settings
        
        Returns:
            Dict containing the updated project details
            
        Raises:
            ValidationError: If parameters are invalid
            ProjectError: If update fails
        """
        if not project_id:
            raise ValidationError("Project ID is required")
        
        data = {}
        if name is not None:
            if not name.strip():
                raise ValidationError("Project name cannot be empty")
            data['name'] = name.strip()
        
        if description is not None:
            data['description'] = description
        
        if visibility is not None:
            if visibility not in ['private', 'public', 'team']:
                raise ValidationError("Visibility must be 'private', 'public', or 'team'")
            data['visibility'] = visibility
        
        if settings is not None:
            data['settings'] = settings
        
        if not data:
            raise ValidationError("At least one field must be provided for update")
        
        try:
            response = self.http_client.patch(f'/projects/{project_id}', data=data)
            return response
        except Exception as e:
            raise ProjectError(f"Failed to update project {project_id}: {str(e)}")
    
    def delete(self, project_id: str, force: bool = False) -> Dict[str, Any]:
        """
        Delete a project.
        
        Args:
            project_id (str): The unique identifier of the project
            force (bool): If True, permanently delete the project. 
                         If False, move to trash (default)
        
        Returns:
            Dict containing deletion confirmation
            
        Raises:
            ValidationError: If project ID is missing
            ProjectError: If deletion fails
        """
        if not project_id:
            raise ValidationError("Project ID is required")
        
        params = {'force': 'true'} if force else {}
        
        try:
            response = self.http_client.delete(f'/projects/{project_id}')
            return response
        except Exception as e:
            raise ProjectError(f"Failed to delete project {project_id}: {str(e)}")
    
    def duplicate(self, project_id: str, name: str) -> Dict[str, Any]:
        """
        Duplicate an existing project.
        
        Args:
            project_id (str): The unique identifier of the project to duplicate
            name (str): Name for the new duplicated project
        
        Returns:
            Dict containing the new project details
            
        Raises:
            ValidationError: If parameters are invalid
            ProjectError: If duplication fails
        """
        if not project_id:
            raise ValidationError("Project ID is required")
        if not name or not name.strip():
            raise ValidationError("New project name is required")
        
        data = {'name': name.strip()}
        
        try:
            response = self.http_client.post(f'/projects/{project_id}/duplicate', data=data)
            return response
        except Exception as e:
            raise ProjectError(f"Failed to duplicate project {project_id}: {str(e)}")
    
    def get_templates(self) -> List[Dict[str, Any]]:
        """
        Get all available project templates.
        
        Returns:
            List of template objects containing:
            - id: Template ID
            - name: Template name
            - description: Template description
            - category: Template category
            - features: List of included features
            - preview_url: Preview image URL
            
        Raises:
            ProjectError: If request fails
        """
        try:
            response = self.http_client.get('/projects/templates')
            return response.get('templates', [])
        except Exception as e:
            raise ProjectError(f"Failed to get templates: {str(e)}")
    
    def get_collaborators(self, project_id: str) -> List[Dict[str, Any]]:
        """
        Get all collaborators for a project.
        
        Args:
            project_id (str): The unique identifier of the project
        
        Returns:
            List of collaborator objects
            
        Raises:
            ProjectError: If request fails
        """
        if not project_id:
            raise ValidationError("Project ID is required")
        
        try:
            response = self.http_client.get(f'/projects/{project_id}/collaborators')
            return response.get('collaborators', [])
        except Exception as e:
            raise ProjectError(f"Failed to get collaborators: {str(e)}")
    
    def add_collaborator(
        self, 
        project_id: str, 
        email: str, 
        role: str = "editor"
    ) -> Dict[str, Any]:
        """
        Add a collaborator to a project.
        
        Args:
            project_id (str): The unique identifier of the project
            email (str): Email address of the user to invite
            role (str): Role for the collaborator ('viewer', 'editor', 'admin')
        
        Returns:
            Dict containing the invitation details
            
        Raises:
            ValidationError: If parameters are invalid
            ProjectError: If invitation fails
        """
        if not project_id:
            raise ValidationError("Project ID is required")
        if not email:
            raise ValidationError("Email is required")
        if role not in ['viewer', 'editor', 'admin']:
            raise ValidationError("Role must be 'viewer', 'editor', or 'admin'")
        
        data = {
            'email': email,
            'role': role
        }
        
        try:
            response = self.http_client.post(f'/projects/{project_id}/collaborators', data=data)
            return response
        except Exception as e:
            raise ProjectError(f"Failed to add collaborator: {str(e)}")
    
    def remove_collaborator(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """
        Remove a collaborator from a project.
        
        Args:
            project_id (str): The unique identifier of the project
            user_id (str): The unique identifier of the user to remove
        
        Returns:
            Dict containing removal confirmation
            
        Raises:
            ValidationError: If parameters are missing
            ProjectError: If removal fails
        """
        if not project_id:
            raise ValidationError("Project ID is required")
        if not user_id:
            raise ValidationError("User ID is required")
        
        try:
            response = self.http_client.delete(f'/projects/{project_id}/collaborators/{user_id}')
            return response
        except Exception as e:
            raise ProjectError(f"Failed to remove collaborator: {str(e)}")
    
    def deploy(self, project_id: str, target: str = "production") -> Dict[str, Any]:
        """
        Deploy a project to the specified target.
        
        Args:
            project_id (str): The unique identifier of the project
            target (str): Deployment target ('production', 'staging', 'preview')
        
        Returns:
            Dict containing deployment details and URL
            
        Raises:
            ValidationError: If parameters are invalid
            ProjectError: If deployment fails
        """
        if not project_id:
            raise ValidationError("Project ID is required")
        if target not in ['production', 'staging', 'preview']:
            raise ValidationError("Target must be 'production', 'staging', or 'preview'")
        
        data = {'target': target}
        
        try:
            response = self.http_client.post(f'/projects/{project_id}/deploy', data=data)
            return response
        except Exception as e:
            raise ProjectError(f"Failed to deploy project: {str(e)}")