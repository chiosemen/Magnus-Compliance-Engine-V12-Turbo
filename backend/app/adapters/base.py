from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple

class EvidenceAdapter(ABC):
    """
    Strict Read-Only Adapter for External Compliance Evidence.
    Violations of this contract (writing, scoring, inferring) will fail CI/CD.
    """

    @abstractmethod
    def fetch_evidence(self, identifier: str) -> Tuple[Dict[str, Any], bytes]:
        """
        Fetches raw data from the external source.
        
        Must return:
        1. The parsed JSON (for display/indexing)
        2. The raw bytes (for canonical hashing)
        
        FAILURE BEHAVIOR:
        - Must raise specific AdapterError on HTTP 4xx/5xx.
        - Must fail CLOSED (return nothing) on partial data.
        - Must NOT attempt retries beyond 1 (prevent storming).
        """
        pass

    @abstractmethod
    def validate_schema(self, payload: Dict[str, Any]) -> bool:
        """
        Validates the structure of the incoming data against a strict schema.
        Data failing validation is discarded immediately.
        """
        pass

    @property
    @abstractmethod
    def source_label(self) -> str:
        """Returns the authoritative source name (e.g., 'Candid-Data-v1')."""
        pass

    def enforce_read_only(self):
        """
        Runtime check to ensure no write methods exist on the client.
        """
        if hasattr(self, 'post') or hasattr(self, 'put') or hasattr(self, 'delete'):
             raise SecurityError("Adapter violates Read-Only Contract")
