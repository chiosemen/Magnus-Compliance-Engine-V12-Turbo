"""
Input validation utilities to prevent SQL injection and other attacks
"""
from typing import List, Union
import re
from uuid import UUID


def validate_int_list(values: List[Union[int, str]]) -> List[int]:
    """
    Validate and convert a list of values to integers.
    
    This prevents SQL injection when using .in_() queries with user-supplied lists.
    
    Args:
        values: List of values to validate and convert
        
    Returns:
        List of validated integers
        
    Raises:
        ValueError: If any value cannot be converted to int
    """
    validated = []
    for value in values:
        try:
            validated.append(int(value))
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid integer value: {value}") from e
    return validated


def validate_uuid_list(values: List[Union[str, UUID]]) -> List[str]:
    """
    Validate and convert a list of values to UUID strings.
    
    This prevents SQL injection when using .in_() queries with user-supplied UUIDs.
    
    Args:
        values: List of UUID values to validate
        
    Returns:
        List of validated UUID strings
        
    Raises:
        ValueError: If any value is not a valid UUID
    """
    validated = []
    for value in values:
        try:
            # Try to parse as UUID to validate format
            if isinstance(value, UUID):
                validated.append(str(value))
            else:
                # This will raise ValueError if not a valid UUID
                uuid_obj = UUID(str(value))
                validated.append(str(uuid_obj))
        except (ValueError, TypeError, AttributeError) as e:
            raise ValueError(f"Invalid UUID value: {value}") from e
    return validated


def sanitize_identifier(identifier: str, max_length: int = 255) -> str:
    """
    Sanitize an identifier (table name, column name, etc.) to prevent SQL injection.
    
    Only allows alphanumeric characters, underscores, and hyphens.
    
    Args:
        identifier: The identifier to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized identifier
        
    Raises:
        ValueError: If identifier contains invalid characters or is too long
    """
    if not identifier or not isinstance(identifier, str):
        raise ValueError("Identifier must be a non-empty string")
    
    if len(identifier) > max_length:
        raise ValueError(f"Identifier too long: {len(identifier)} > {max_length}")
    
    # Only allow alphanumeric, underscore, and hyphen
    if not re.match(r'^[a-zA-Z0-9_-]+$', identifier):
        raise ValueError(f"Identifier contains invalid characters: {identifier}")
    
    return identifier
