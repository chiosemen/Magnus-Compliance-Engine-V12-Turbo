import os
import sys
import unittest
import json
import subprocess
from datetime import datetime
from unittest.mock import MagicMock, patch

# In backend dir, valid imports work naturally


class T01_StartupConfiguration(unittest.TestCase):
    """Verify application hard-fails if required secrets are missing or insecure."""

    def test_fail_production_missing_secrets(self):
        env = os.environ.copy()
        env['APP_MODE'] = 'production'
        if 'DATABASE_URL' in env: del env['DATABASE_URL']
        if 'JWT_SECRET' in env: del env['JWT_SECRET']
        
        # Python script to import config
        cmd = [sys.executable, "-c", "import sys; sys.path.append('backend'); from app import config"]
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        self.assertNotEqual(result.returncode, 0, "App should fail in production without secrets")
        self.assertIn("FATAL", result.stderr)

    def test_fail_production_weak_secret(self):
        env = os.environ.copy()
        env['APP_MODE'] = 'production'
        env['DATABASE_URL'] = 'postgresql://user:pass@localhost/db'
        env['JWT_SECRET'] = 'weak' # < 32 chars
        
        cmd = [sys.executable, "-c", "import sys; sys.path.append('backend'); from app import config"]
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        self.assertNotEqual(result.returncode, 0, "App should fail in production with weak secret")
        self.assertIn("FATAL", result.stderr)

    def test_success_dev_mode(self):
        env = os.environ.copy()
        env['APP_MODE'] = 'dev'
        # config.py has defaults for dev mode, so this should pass even without explicit vars
        if 'DATABASE_URL' in env: del env['DATABASE_URL']
        
        cmd = [sys.executable, "-c", "import sys; sys.path.append('backend'); from app import config"]
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        self.assertEqual(result.returncode, 0, "App should start in dev mode with defaults")


class T02_AuditChainInvariants(unittest.TestCase):
    """Verify audit chain remains linear and hashing is canonical."""

    def test_canonical_json_hashing(self):
        from app.services.audit_service import canonical_json, compute_event_hash
        
        payload_1 = {"b": 2, "a": 1}
        payload_2 = {"a": 1, "b": 2}
        
        # Invariants: 
        # 1. Order shouldn't matter
        # 2. No whitespace
        self.assertEqual(canonical_json(payload_1), canonical_json(payload_2))
        self.assertEqual(canonical_json(payload_1), '{"a":1,"b":2}')

    def test_hash_stability(self):
         from app.services.audit_service import compute_event_hash
         
         # Mock inputs
         prev_hash = "abc"
         event_type = "TEST"
         actor_id = "user-1"
         entity_type = "doc"
         entity_id = "doc-1"
         payload = {"foo": "bar"}
         created_at = datetime(2023, 1, 1, 12, 0, 0)
         
         scan1 = compute_event_hash(prev_hash, event_type, actor_id, entity_type, entity_id, payload, created_at)
         scan2 = compute_event_hash(prev_hash, event_type, actor_id, entity_type, entity_id, payload, created_at)
         
         self.assertEqual(scan1, scan2, "Hashing must be deterministic")


class T03_AsyncIngestion(unittest.TestCase):
    """Verify async ingestion logic."""
    
    def test_ingestion_split(self):
        from app.routers import ingestion
        from app.schemas import IngestionJobCreate
        from app.models import Client
        
        # Setup Mocks
        mock_session = MagicMock()
        mock_user = Client(client_id="org-123", tier="continuous", status="active")
        
        # Test Case 1: IDOR Protection
        job_request = IngestionJobCreate(org_id="org-456", ein="123456789") # Requesting for different org
        
        with self.assertRaises(Exception) as context:
            # We need to manually invoke the logic or mock the dependency injection
            # Since we can't easily mock FastAPI depends here, we test the logic block directly if we extracted it,
            # or we rely on the router function logic.
            # Let's verify the router function directly.
            ingestion.irs990(job_request, mock_session, mock_user)
            
        self.assertEqual(context.exception.status_code, 403)
        self.assertIn("Not authorized", context.exception.detail)

        # Test Case 2: Successful Dispatch
        job_request_valid = IngestionJobCreate(org_id="org-123", ein="123456789")
        
        # Mock create_ingestion_job to return a dummy job
        with patch('app.routers.ingestion.create_ingestion_job') as mock_create:
            mock_create.return_value = MagicMock(id=1, status="queued")
            with patch('app.routers.ingestion.task_process_ingestion_job.delay') as mock_delay:
                response = ingestion.irs990(job_request_valid, mock_session, mock_user)
                
                # Check that we got a job back
                self.assertEqual(response.status, "queued")
                # Check that the task was dispatched
                mock_delay.assert_called_once_with(1)


if __name__ == '__main__':
    unittest.main()
