"""
CaaS External Integration Service - IRS 990 API
Handles retrieval and parsing of IRS Form 990 data
Version: 1.0.0
"""

import httpx
import logging
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class IRS990Data(BaseModel):
    ein: str
    organization_name: str
    tax_year: int
    total_revenue: float
    total_assets: float
    officer_compensation: float
    related_party_transactions: bool
    raw_payload: Optional[Dict] = None

class IRSIntegrationService:
    """
    Service to interact with IRS Business Master File (BMF) and 990 XML APIs
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        # IRS Index files are often on AWS Public Datasets
        self.base_url = "https://projects.propublica.org/nonprofits/api/v2" # Using ProPublica as proxy for demo
        logger.info("IRS Integration Service initialized")

    async def fetch_org_data(self, ein: str) -> Optional[IRS990Data]:
        """
        Fetch latest 990 data for a given EIN
        """
        async with httpx.AsyncClient() as client:
            try:
                logger.info(f"Fetching IRS data for EIN: {ein}")
                response = await client.get(f"{self.base_url}/organizations/{ein}.json")
                
                if response.status_code != 200:
                    logger.error(f"IRS API returned error: {response.status_code}")
                    return None
                    
                data = response.json()
                org = data.get('organization', {})
                filing = data.get('filings_with_data', [{}])[0]
                
                return IRS990Data(
                    ein=ein,
                    organization_name=org.get('name', 'Unknown'),
                    tax_year=filing.get('tax_year', 2023),
                    total_revenue=filing.get('revenue_amount', 0.0),
                    total_assets=filing.get('asset_amount', 0.0),
                    officer_compensation=filing.get('officer_compensation', 0.0),
                    related_party_transactions=True if filing.get('has_related_party_trans', 'N') == 'Y' else False,
                    raw_payload=data
                )
            except Exception as e:
                logger.error(f"Failed to fetch IRS data: {str(e)}")
                return None

    def map_to_transaction_stream(self, irs_data: IRS990Data) -> List[Dict]:
        """
        Maps 990 line items into the Transaction format for the Risk Engine
        """
        # Logic to extract Schedule L (Transactions with Interested Persons)
        # For demo, mapping compensation and potential related party hits
        transactions = []
        
        if irs_data.officer_compensation > 0:
            transactions.append({
                "transaction_id": f"IRS-COMP-{irs_data.ein}",
                "amount": irs_data.officer_compensation,
                "description": "Reported Officer Compensation",
                "metadata": {
                    "source": "IRS-990",
                    "type": "compensation",
                    "donor_relationship": "interested_person"
                }
            })
            
        return transactions

if __name__ == "__main__":
    import asyncio
    service = IRSIntegrationService()
    # Test with a known EIN (e.g., Gates Foundation or similar)
    # result = asyncio.run(service.fetch_org_data("562241728"))
    # print(result)
