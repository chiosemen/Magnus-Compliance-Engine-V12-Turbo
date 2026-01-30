"""
Timezone-aware datetime utilities for consistent time handling
"""
from datetime import datetime, timezone


def now_utc() -> datetime:
    """
    Returns current UTC time with timezone awareness.
    
    This replaces datetime.utcnow() which returns naive datetime objects.
    Using timezone-aware datetimes prevents subtle bugs and is required
    for proper datetime comparisons and serialization.
    
    Returns:
        datetime: Current UTC time with timezone information
    """
    return datetime.now(timezone.utc)
