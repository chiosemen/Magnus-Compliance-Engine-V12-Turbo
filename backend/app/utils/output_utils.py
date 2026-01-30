"""
Output sanitization utilities to prevent XSS attacks
"""
import html
from typing import Optional


def escape_html(text: Optional[str]) -> str:
    """
    Escape HTML special characters to prevent XSS attacks.
    
    This should be used when returning user-supplied text that might
    be rendered in a web browser.
    
    Args:
        text: The text to escape
        
    Returns:
        HTML-escaped text, or empty string if input is None
    """
    if text is None:
        return ""
    return html.escape(str(text))


def escape_for_log(text: Optional[str]) -> str:
    """
    Sanitize text for safe logging to prevent log injection.
    
    Removes newlines and other control characters that could be used
    for log injection attacks.
    
    Args:
        text: The text to sanitize
        
    Returns:
        Sanitized text safe for logging
    """
    if text is None:
        return ""
    
    # Convert to string and replace newlines with spaces
    sanitized = str(text).replace('\n', ' ').replace('\r', ' ')
    
    # Remove other control characters
    sanitized = ''.join(char for char in sanitized if ord(char) >= 32 or char == '\t')
    
    return sanitized
