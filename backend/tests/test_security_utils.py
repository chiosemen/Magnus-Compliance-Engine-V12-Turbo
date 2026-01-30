"""
Unit tests for security utilities
"""
import pytest
from datetime import datetime, timezone
from pathlib import Path
import tempfile
import os
import sys

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


class TestTimeUtils:
    """Tests for timezone-aware datetime utilities"""
    
    def test_now_utc_returns_timezone_aware(self):
        """Test that now_utc() returns timezone-aware datetime"""
        from app.utils.time_utils import now_utc
        
        result = now_utc()
        
        assert isinstance(result, datetime)
        assert result.tzinfo is not None
        assert result.tzinfo == timezone.utc
    
    def test_now_utc_is_current_time(self):
        """Test that now_utc() returns current time"""
        from app.utils.time_utils import now_utc
        
        before = datetime.now(timezone.utc)
        result = now_utc()
        after = datetime.now(timezone.utc)
        
        assert before <= result <= after


class TestInputValidation:
    """Tests for input validation utilities"""
    
    def test_validate_int_list_with_valid_integers(self):
        """Test validation of valid integer list"""
        from app.utils.input_validation import validate_int_list
        
        result = validate_int_list([1, 2, 3, "4", "5"])
        
        assert result == [1, 2, 3, 4, 5]
        assert all(isinstance(x, int) for x in result)
    
    def test_validate_int_list_with_invalid_values(self):
        """Test validation rejects invalid values"""
        from app.utils.input_validation import validate_int_list
        
        with pytest.raises(ValueError, match="Invalid integer value"):
            validate_int_list([1, 2, "invalid"])
    
    def test_validate_uuid_list_with_valid_uuids(self):
        """Test validation of valid UUID list"""
        from app.utils.input_validation import validate_uuid_list
        from uuid import UUID
        
        valid_uuids = [
            "550e8400-e29b-41d4-a716-446655440000",
            UUID("550e8400-e29b-41d4-a716-446655440001")
        ]
        
        result = validate_uuid_list(valid_uuids)
        
        assert len(result) == 2
        assert all(isinstance(x, str) for x in result)
    
    def test_validate_uuid_list_with_invalid_uuids(self):
        """Test validation rejects invalid UUIDs"""
        from app.utils.input_validation import validate_uuid_list
        
        with pytest.raises(ValueError, match="Invalid UUID value"):
            validate_uuid_list(["not-a-uuid"])
    
    def test_sanitize_identifier_with_valid_input(self):
        """Test sanitization of valid identifier"""
        from app.utils.input_validation import sanitize_identifier
        
        result = sanitize_identifier("valid_table_name")
        assert result == "valid_table_name"
        
        result = sanitize_identifier("table-123")
        assert result == "table-123"
    
    def test_sanitize_identifier_rejects_invalid_characters(self):
        """Test sanitization rejects SQL injection attempts"""
        from app.utils.input_validation import sanitize_identifier
        
        with pytest.raises(ValueError, match="invalid characters"):
            sanitize_identifier("table; DROP TABLE users--")
        
        with pytest.raises(ValueError, match="invalid characters"):
            sanitize_identifier("table' OR '1'='1")
    
    def test_sanitize_identifier_rejects_too_long(self):
        """Test sanitization rejects overly long identifiers"""
        from app.utils.input_validation import sanitize_identifier
        
        with pytest.raises(ValueError, match="too long"):
            sanitize_identifier("a" * 300)


class TestPathUtils:
    """Tests for path sanitization utilities"""
    
    def test_sanitize_path_with_safe_path(self):
        """Test sanitization allows safe paths"""
        from app.utils.path_utils import sanitize_path
        
        with tempfile.TemporaryDirectory() as tmpdir:
            base_dir = Path(tmpdir)
            user_path = "subdir/file.txt"
            
            result = sanitize_path(base_dir, user_path)
            
            # Check if path is within base directory
            try:
                result.relative_to(base_dir)
                is_safe = True
            except ValueError:
                is_safe = False
            
            assert is_safe
            assert str(result).endswith("file.txt")
    
    def test_sanitize_path_blocks_traversal(self):
        """Test sanitization blocks directory traversal"""
        from app.utils.path_utils import sanitize_path
        
        with tempfile.TemporaryDirectory() as tmpdir:
            base_dir = Path(tmpdir)
            
            # Attempt to escape base directory
            with pytest.raises(ValueError, match="Path traversal detected"):
                sanitize_path(base_dir, "../../../etc/passwd")
    
    def test_sanitize_path_blocks_absolute_paths(self):
        """Test sanitization blocks absolute path injection"""
        from app.utils.path_utils import sanitize_path
        
        with tempfile.TemporaryDirectory() as tmpdir:
            base_dir = Path(tmpdir)
            
            # Attempt to use absolute path
            with pytest.raises(ValueError, match="Path traversal detected"):
                sanitize_path(base_dir, "/etc/passwd")
    
    def test_validate_filename_accepts_safe_names(self):
        """Test filename validation accepts safe names"""
        from app.utils.path_utils import validate_filename
        
        assert validate_filename("report.pdf") == "report.pdf"
        assert validate_filename("data_2024.csv") == "data_2024.csv"
    
    def test_validate_filename_rejects_path_separators(self):
        """Test filename validation rejects paths"""
        from app.utils.path_utils import validate_filename
        
        with pytest.raises(ValueError, match="path separators"):
            validate_filename("../etc/passwd")
        
        with pytest.raises(ValueError, match="path separators"):
            validate_filename("subdir/file.txt")
    
    def test_validate_filename_rejects_hidden_files(self):
        """Test filename validation rejects hidden files"""
        from app.utils.path_utils import validate_filename
        
        with pytest.raises(ValueError, match="Hidden filenames"):
            validate_filename(".hidden")


class TestOutputUtils:
    """Tests for output sanitization utilities"""
    
    def test_escape_html_escapes_special_chars(self):
        """Test HTML escaping of special characters"""
        from app.utils.output_utils import escape_html
        
        result = escape_html("<script>alert('XSS')</script>")
        
        assert "<script>" not in result
        assert "&lt;script&gt;" in result
        assert "alert" in result
    
    def test_escape_html_handles_none(self):
        """Test HTML escaping handles None gracefully"""
        from app.utils.output_utils import escape_html
        
        result = escape_html(None)
        
        assert result == ""
    
    def test_escape_html_handles_quotes(self):
        """Test HTML escaping handles quotes"""
        from app.utils.output_utils import escape_html
        
        result = escape_html('"><script>alert("XSS")</script>')
        
        assert '<script>' not in result
        assert '&quot;' in result or '&#x27;' in result
    
    def test_escape_for_log_removes_newlines(self):
        """Test log escaping removes newlines"""
        from app.utils.output_utils import escape_for_log
        
        result = escape_for_log("Line 1\nLine 2\rLine 3")
        
        assert "\n" not in result
        assert "\r" not in result
        assert "Line 1" in result
        assert "Line 2" in result
    
    def test_escape_for_log_removes_control_chars(self):
        """Test log escaping removes control characters"""
        from app.utils.output_utils import escape_for_log
        
        # Test with various control characters
        result = escape_for_log("Text\x00\x01\x02\x1f")
        
        assert "\x00" not in result
        assert "\x01" not in result
        assert "Text" in result
