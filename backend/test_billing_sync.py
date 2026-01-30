
import unittest
from app.routers.clients import SubscriptionTier, client_service, ClientCreate
from app.routers.billing import sync_tier_to_flags, TIER_FEATURE_FLAGS

class TestBillingSync(unittest.TestCase):
    def setUp(self):
        # Create a mock client
        client_data = ClientCreate(
            organization_name="Test Org",
            email="test@example.com",
            tier=SubscriptionTier.FOUNDATION,
            password="securepassword"
        )
        self.client = client_service.create_client(client_data)
        self.client_id = self.client.client_id

    def test_foundation_sync(self):
        sync_tier_to_flags(self.client_id, SubscriptionTier.FOUNDATION)
        client = client_service.get_client(self.client_id)
        flags = client.metadata["feature_flags"]
        
        self.assertTrue(flags["documents"])
        self.assertTrue(flags["templates"])
        self.assertFalse(flags["diagnostics"])
        self.assertFalse(flags["workflows"])

    def test_diagnostic_sync(self):
        sync_tier_to_flags(self.client_id, SubscriptionTier.DIAGNOSTIC)
        client = client_service.get_client(self.client_id)
        flags = client.metadata["feature_flags"]
        
        self.assertTrue(flags["documents"])
        self.assertTrue(flags["templates"])
        self.assertTrue(flags["diagnostics"])
        self.assertTrue(flags["roadmap"])
        self.assertTrue(flags["trends"])
        self.assertFalse(flags["workflows"])

    def test_continuous_sync(self):
        sync_tier_to_flags(self.client_id, SubscriptionTier.CONTINUOUS)
        client = client_service.get_client(self.client_id)
        flags = client.metadata["feature_flags"]
        
        self.assertTrue(flags["documents"])
        self.assertTrue(flags["templates"])
        self.assertTrue(flags["diagnostics"])
        self.assertTrue(flags["workflows"])
        self.assertTrue(flags["exports"])

if __name__ == '__main__':
    unittest.main()
