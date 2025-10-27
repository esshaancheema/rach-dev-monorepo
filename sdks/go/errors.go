package zoptal

import "fmt"

// ZoptalError is the base error type for all Zoptal SDK errors.
type ZoptalError struct {
	Message   string
	ErrorCode string
	Cause     error
}

// Error implements the error interface.
func (e *ZoptalError) Error() string {
	if e.ErrorCode != "" {
		return fmt.Sprintf("[%s] %s", e.ErrorCode, e.Message)
	}
	return e.Message
}

// Unwrap returns the underlying cause of the error.
func (e *ZoptalError) Unwrap() error {
	return e.Cause
}

// AuthenticationError represents an authentication failure.
type AuthenticationError struct {
	*ZoptalError
}

// NewAuthenticationError creates a new authentication error.
func NewAuthenticationError(message string) *AuthenticationError {
	return &AuthenticationError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "AUTH_ERROR",
		},
	}
}

// APIError represents a general API error.
type APIError struct {
	*ZoptalError
	StatusCode int
}

// NewAPIError creates a new API error.
func NewAPIError(message string) *APIError {
	return &APIError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "API_ERROR",
		},
	}
}

// NewAPIErrorWithStatus creates a new API error with a status code.
func NewAPIErrorWithStatus(message string, statusCode int) *APIError {
	return &APIError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "API_ERROR",
		},
		StatusCode: statusCode,
	}
}

// RateLimitError represents a rate limiting error.
type RateLimitError struct {
	*ZoptalError
}

// NewRateLimitError creates a new rate limit error.
func NewRateLimitError(message string) *RateLimitError {
	return &RateLimitError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "RATE_LIMIT",
		},
	}
}

// NotFoundError represents a resource not found error.
type NotFoundError struct {
	*ZoptalError
}

// NewNotFoundError creates a new not found error.
func NewNotFoundError(message string) *NotFoundError {
	return &NotFoundError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "NOT_FOUND",
		},
	}
}

// ValidationError represents a validation error.
type ValidationError struct {
	*ZoptalError
}

// NewValidationError creates a new validation error.
func NewValidationError(message string) *ValidationError {
	return &ValidationError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "VALIDATION_ERROR",
		},
	}
}

// ProjectError represents a project-related error.
type ProjectError struct {
	*ZoptalError
}

// NewProjectError creates a new project error.
func NewProjectError(message string) *ProjectError {
	return &ProjectError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "PROJECT_ERROR",
		},
	}
}

// FileError represents a file operation error.
type FileError struct {
	*ZoptalError
}

// NewFileError creates a new file error.
func NewFileError(message string) *FileError {
	return &FileError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "FILE_ERROR",
		},
	}
}

// AIError represents an AI service error.
type AIError struct {
	*ZoptalError
}

// NewAIError creates a new AI error.
func NewAIError(message string) *AIError {
	return &AIError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "AI_ERROR",
		},
	}
}

// CollaborationError represents a collaboration feature error.
type CollaborationError struct {
	*ZoptalError
}

// NewCollaborationError creates a new collaboration error.
func NewCollaborationError(message string) *CollaborationError {
	return &CollaborationError{
		ZoptalError: &ZoptalError{
			Message:   message,
			ErrorCode: "COLLABORATION_ERROR",
		},
	}
}

// Error type checking functions

// IsZoptalError checks if an error is a Zoptal SDK error.
func IsZoptalError(err error) bool {
	_, ok := err.(*ZoptalError)
	return ok
}

// IsAuthenticationError checks if an error is an authentication error.
func IsAuthenticationError(err error) bool {
	_, ok := err.(*AuthenticationError)
	return ok
}

// IsAPIError checks if an error is an API error.
func IsAPIError(err error) bool {
	_, ok := err.(*APIError)
	return ok
}

// IsRateLimitError checks if an error is a rate limit error.
func IsRateLimitError(err error) bool {
	_, ok := err.(*RateLimitError)
	return ok
}

// IsNotFoundError checks if an error is a not found error.
func IsNotFoundError(err error) bool {
	_, ok := err.(*NotFoundError)
	return ok
}

// IsValidationError checks if an error is a validation error.
func IsValidationError(err error) bool {
	_, ok := err.(*ValidationError)
	return ok
}

// IsProjectError checks if an error is a project error.
func IsProjectError(err error) bool {
	_, ok := err.(*ProjectError)
	return ok
}

// IsFileError checks if an error is a file error.
func IsFileError(err error) bool {
	_, ok := err.(*FileError)
	return ok
}

// IsAIError checks if an error is an AI error.
func IsAIError(err error) bool {
	_, ok := err.(*AIError)
	return ok
}

// IsCollaborationError checks if an error is a collaboration error.
func IsCollaborationError(err error) bool {
	_, ok := err.(*CollaborationError)
	return ok
}