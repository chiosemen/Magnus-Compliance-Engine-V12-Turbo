"""
Path sanitization utilities to prevent path traversal attacks
"""
from pathlib import Path
from typing import Union


def sanitize_path(base_dir: Union[str, Path], user_path: Union[str, Path]) -> Path:
    """
    Sanitize a user-provided path to prevent directory traversal attacks.
    
    Ensures that the resolved path is within the base directory.
    
    Args:
        base_dir: The base directory that should contain the path
        user_path: The user-provided path component
        
    Returns:
        Sanitized, resolved path
        
    Raises:
        ValueError: If the path attempts to escape the base directory
    """
    base_dir = Path(base_dir).resolve()
    
    # Join with base directory and resolve to get absolute path
    # This will resolve .. and symlinks
    full_path = (base_dir / user_path).resolve()
    
    # Check if the resolved path is within the base directory
    try:
        full_path.relative_to(base_dir)
    except ValueError as e:
        raise ValueError(
            f"Path traversal detected: {user_path} resolves outside base directory"
        ) from e
    
    return full_path


def validate_filename(filename: str) -> str:
    """
    Validate a filename to ensure it doesn't contain path separators.
    
    Args:
        filename: The filename to validate
        
    Returns:
        The validated filename
        
    Raises:
        ValueError: If the filename contains path separators or other invalid characters
    """
    if not filename or not isinstance(filename, str):
        raise ValueError("Filename must be a non-empty string")
    
    # Check for path separators
    if '/' in filename or '\\' in filename:
        raise ValueError(f"Filename cannot contain path separators: {filename}")
    
    # Check for null bytes
    if '\0' in filename:
        raise ValueError("Filename cannot contain null bytes")
    
    # Check for hidden files (Unix-style)
    if filename.startswith('.'):
        raise ValueError("Hidden filenames are not allowed")
    
    return filename
