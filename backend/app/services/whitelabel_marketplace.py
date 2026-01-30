"""
Magnus CaaS White-Label Platform & API Marketplace
B2B2C revenue engine enabling partner reselling and third-party integrations
Competitive Advantage: 3x revenue multiplier, ecosystem lock-in

Version: 1.0.0
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import timedelta
from enum import Enum
import logging
from ..utils.output_utils import escape_html
from ..utils.time_utils import now_utc

# Need datetime for Field annotation
from datetime import datetime

logger = logging.getLogger(__name__)


# ==================== White-Label Platform Models ====================

class BrandingProfile(BaseModel):
    """White-label branding configuration"""
    partner_id: str
    company_name: str
    logo_url: str
    primary_color: str
    secondary_color: str
    custom_domain: Optional[str] = None
    custom_css: Optional[str] = None
    email_from_name: str
    email_from_address: EmailStr


class PartnerTier(str, Enum):
    """Partner program tiers"""
    AFFILIATE = "affiliate"  # 10% revenue share
    RESELLER = "reseller"  # 20% revenue share
    STRATEGIC = "strategic"  # 30% revenue share + co-branding


class Partner(BaseModel):
    """Partner account"""
    partner_id: str
    company_name: str
    tier: PartnerTier
    branding: BrandingProfile
    revenue_share_percentage: float = Field(ge=0, le=50)
    total_clients: int = 0
    monthly_recurring_revenue: float = 0.0
    commission_earned: float = 0.0
    api_access_enabled: bool = False
    created_at: datetime = Field(default_factory=now_utc)


class PartnerCommission(BaseModel):
    """Commission calculation"""
    partner_id: str
    client_id: str
    transaction_amount: float
    commission_percentage: float
    commission_amount: float
    payment_status: str = "pending"
    payment_date: Optional[datetime] = None


# ==================== API Marketplace Models ====================

class APICategory(str, Enum):
    """API integration categories"""
    CRM = "crm"  # Salesforce, HubSpot
    ACCOUNTING = "accounting"  # QuickBooks, Xero
    LEGAL = "legal"  # Clio, PracticePanther
    DATA = "data"  # IRS APIs, 990 data feeds
    REPORTING = "reporting"  # Tableau, PowerBI
    NOTIFICATION = "notification"  # Slack, Email


class IntegrationStatus(str, Enum):
    """Integration status"""
    ACTIVE = "active"
    BETA = "beta"
    DEPRECATED = "deprecated"
    COMING_SOON = "coming_soon"


class APIIntegration(BaseModel):
    """Third-party API integration"""
    integration_id: str
    name: str
    category: APICategory
    description: str
    provider: str
    status: IntegrationStatus
    pricing_model: str  # "free", "freemium", "paid"
    monthly_cost: Optional[float] = None
    installation_count: int = 0
    avg_rating: float = Field(ge=0, le=5, default=0.0)
    documentation_url: str
    webhook_url: Optional[str] = None


class APIKey(BaseModel):
    """API key for marketplace access"""
    api_key_id: str
    partner_id: str
    key_hash: str
    permissions: List[str]
    rate_limit: int = 1000  # requests per hour
    created_at: datetime = Field(default_factory=now_utc)
    expires_at: Optional[datetime] = None
    last_used: Optional[datetime] = None
    usage_count: int = 0


class MarketplaceApp(BaseModel):
    """Marketplace application listing"""
    app_id: str
    developer_id: str
    app_name: str
    description: str
    category: APICategory
    pricing: str
    monthly_active_users: int = 0
    total_installs: int = 0
    revenue_share_percentage: float = 30.0  # CaaS takes 30%
    screenshot_urls: List[str] = Field(default_factory=list)
    published_at: Optional[datetime] = None


# ==================== White-Label Platform Manager ====================

class WhiteLabelPlatform:
    """
    White-label platform management for partner reselling
    
    Capabilities:
    - Custom branding (logo, colors, domain)
    - Partner portal with client management
    - Automated commission calculations
    - Revenue sharing and payouts
    - Multi-tenant architecture
    
    Revenue Model:
    - Affiliate (10% share): Marketing partners
    - Reseller (20% share): Full service providers
    - Strategic (30% share): Enterprise partnerships
    
    Competitive Advantage:
    - 3x revenue multiplier (300 direct + 900 partner clients)
    - Sticky partnerships (high switching costs)
    - Network effects (more partners = more integrations)
    """
    
    def __init__(self):
        self.partners: Dict[str, Partner] = {}
        self.revenue_share_tiers = {
            PartnerTier.AFFILIATE: 0.10,
            PartnerTier.RESELLER: 0.20,
            PartnerTier.STRATEGIC: 0.30
        }
        logger.info("White-Label Platform initialized")
    
    def onboard_partner(
        self,
        company_name: str,
        tier: PartnerTier,
        branding: BrandingProfile
    ) -> Partner:
        """
        Onboard new partner with white-label configuration
        
        Args:
            company_name: Partner company name
            tier: Partnership tier
            branding: Branding configuration
            
        Returns:
            Partner account
        """
        partner_id = f"PTR-{now_utc().strftime('%Y%m%d%H%M%S')}"
        
        partner = Partner(
            partner_id=partner_id,
            company_name=company_name,
            tier=tier,
            branding=branding,
            revenue_share_percentage=self.revenue_share_tiers[tier] * 100,
            api_access_enabled=(tier in [PartnerTier.RESELLER, PartnerTier.STRATEGIC])
        )
        
        self.partners[partner_id] = partner
        
        logger.info("Onboarded partner %s: %s (%s)", partner_id, company_name, tier.value)
        return partner
    
    def calculate_commission(
        self,
        partner_id: str,
        client_subscription_amount: float
    ) -> PartnerCommission:
        """
        Calculate partner commission for client subscription
        
        Args:
            partner_id: Partner identifier
            client_subscription_amount: Monthly subscription amount
            
        Returns:
            Commission calculation
        """
        partner = self.partners.get(partner_id)
        if not partner:
            raise ValueError(f"Partner {partner_id} not found")
        
        commission_percentage = partner.revenue_share_percentage / 100
        commission_amount = client_subscription_amount * commission_percentage
        
        commission = PartnerCommission(
            partner_id=partner_id,
            client_id="CLI-XXXXX",  # Client ID would be passed in
            transaction_amount=client_subscription_amount,
            commission_percentage=commission_percentage,
            commission_amount=commission_amount
        )
        
        # Update partner totals
        partner.commission_earned += commission_amount
        partner.monthly_recurring_revenue += client_subscription_amount
        
        logger.info("Calculated commission: %s earns $%.2f", partner_id, commission_amount)
        return commission
    
    def generate_partner_portal_url(
        self,
        partner_id: str
    ) -> str:
        """
        Generate unique partner portal URL
        
        Args:
            partner_id: Partner identifier
            
        Returns:
            Partner portal URL
        """
        partner = self.partners.get(partner_id)
        if not partner:
            raise ValueError(f"Partner {partner_id} not found")
        
        # Use custom domain if configured
        if partner.branding.custom_domain:
            url = f"https://{partner.branding.custom_domain}/portal"
        else:
            # Subdomain approach
            subdomain = partner.company_name.lower().replace(' ', '-')
            url = f"https://{subdomain}.caas-platform.com/portal"
        
        logger.info("Generated portal URL for %s: %s", partner_id, url)
        return url
    
    def apply_custom_branding(
        self,
        partner_id: str
    ) -> Dict[str, str]:
        """
        Generate custom CSS/branding for partner portal
        
        Args:
            partner_id: Partner identifier
            
        Returns:
            Branding configuration
        """
        partner = self.partners.get(partner_id)
        if not partner:
            raise ValueError(f"Partner {partner_id} not found")
        
        # Escape user-supplied values to prevent XSS
        branding_config = {
            'logo_url': escape_html(partner.branding.logo_url),
            'primary_color': escape_html(partner.branding.primary_color),
            'secondary_color': escape_html(partner.branding.secondary_color),
            'company_name': escape_html(partner.branding.company_name),
            'custom_css': partner.branding.custom_css or self._generate_default_css(partner.branding)
        }
        
        return branding_config
    
    def get_partner_analytics(
        self,
        partner_id: str
    ) -> Dict[str, any]:
        """
        Get partner performance analytics
        
        Args:
            partner_id: Partner identifier
            
        Returns:
            Analytics dashboard data
        """
        partner = self.partners.get(partner_id)
        if not partner:
            raise ValueError(f"Partner {partner_id} not found")
        
        analytics = {
            'partner_id': partner_id,
            'company_name': partner.company_name,
            'tier': partner.tier.value,
            'total_clients': partner.total_clients,
            'monthly_recurring_revenue': partner.monthly_recurring_revenue,
            'commission_earned_ytd': partner.commission_earned,
            'commission_percentage': partner.revenue_share_percentage,
            'avg_revenue_per_client': partner.monthly_recurring_revenue / partner.total_clients if partner.total_clients > 0 else 0,
            'growth_potential': self._calculate_growth_potential(partner)
        }
        
        return analytics
    
    def _generate_default_css(self, branding: BrandingProfile) -> str:
        """Generate default CSS from branding"""
        # Escape user-supplied values to prevent XSS
        primary_color = escape_html(branding.primary_color)
        secondary_color = escape_html(branding.secondary_color)
        logo_url = escape_html(branding.logo_url)
        
        css = f"""
        :root {{
            --primary-color: {primary_color};
            --secondary-color: {secondary_color};
        }}
        .btn-primary {{
            background-color: var(--primary-color);
        }}
        .nav-header {{
            background-color: var(--secondary-color);
        }}
        .logo {{
            background-image: url('{logo_url}');
        }}
        """
        return css
    
    def _calculate_growth_potential(self, partner: Partner) -> str:
        """Calculate partner growth potential"""
        if partner.total_clients < 10:
            return "High - Early stage, rapid growth opportunity"
        elif partner.total_clients < 50:
            return "Medium - Scaling phase, optimize operations"
        else:
            return "Mature - Focus on retention and upsells"


# ==================== API Marketplace Manager ====================

class APIMarketplace:
    """
    API marketplace for third-party integrations
    
    Capabilities:
    - Integration directory (CRM, accounting, legal, etc.)
    - OAuth-based authentication
    - Webhook management
    - Developer portal with documentation
    - Revenue sharing with integration developers
    
    Revenue Model:
    - CaaS takes 30% of integration revenue
    - Developers earn 70%
    - Free tier available for ecosystem growth
    
    Competitive Advantage:
    - Network effects (more apps = more value)
    - Lock-in through integrations
    - Additional revenue stream ($10-50K/month)
    """
    
    def __init__(self):
        self.integrations: Dict[str, APIIntegration] = {}
        self.api_keys: Dict[str, APIKey] = {}
        self.marketplace_apps: Dict[str, MarketplaceApp] = {}
        self._seed_integrations()
        logger.info("API Marketplace initialized")
    
    def register_integration(
        self,
        name: str,
        category: APICategory,
        provider: str,
        description: str,
        pricing_model: str
    ) -> APIIntegration:
        """
        Register new third-party integration
        
        Args:
            name: Integration name
            category: Integration category
            provider: Provider/developer
            description: Description
            pricing_model: Pricing model
            
        Returns:
            APIIntegration object
        """
        integration_id = f"INT-{len(self.integrations):04d}"
        
        integration = APIIntegration(
            integration_id=integration_id,
            name=name,
            category=category,
            description=description,
            provider=provider,
            status=IntegrationStatus.ACTIVE,
            pricing_model=pricing_model,
            documentation_url=f"https://api.caas-platform.com/docs/integrations/{integration_id}"
        )
        
        self.integrations[integration_id] = integration
        
        logger.info("Registered integration: %s (%s)", name, integration_id)
        return integration
    
    def generate_api_key(
        self,
        partner_id: str,
        permissions: List[str]
    ) -> APIKey:
        """
        Generate API key for partner access
        
        Args:
            partner_id: Partner identifier
            permissions: List of granted permissions
            
        Returns:
            APIKey object
        """
        import hashlib
        import secrets
        
        # Generate secure API key
        raw_key = secrets.token_urlsafe(32)
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        api_key_id = f"KEY-{now_utc().strftime('%Y%m%d%H%M%S')}"
        
        api_key = APIKey(
            api_key_id=api_key_id,
            partner_id=partner_id,
            key_hash=key_hash,
            permissions=permissions,
            rate_limit=5000,  # Premium partners get higher limits
            expires_at=now_utc() + timedelta(days=365)
        )
        
        self.api_keys[api_key_id] = api_key
        
        logger.info("Generated API key %s for partner %s", api_key_id, partner_id)
        
        # Return actual key only once (not stored)
        return api_key, raw_key
    
    def publish_marketplace_app(
        self,
        developer_id: str,
        app_name: str,
        description: str,
        category: APICategory,
        pricing: str
    ) -> MarketplaceApp:
        """
        Publish app to marketplace
        
        Args:
            developer_id: Developer/vendor ID
            app_name: Application name
            description: Description
            category: App category
            pricing: Pricing information
            
        Returns:
            MarketplaceApp listing
        """
        app_id = f"APP-{len(self.marketplace_apps):04d}"
        
        app = MarketplaceApp(
            app_id=app_id,
            developer_id=developer_id,
            app_name=app_name,
            description=description,
            category=category,
            pricing=pricing,
            published_at=now_utc()
        )
        
        self.marketplace_apps[app_id] = app
        
        logger.info("Published marketplace app: %s (%s)", app_name, app_id)
        return app
    
    def get_integration_directory(
        self,
        category: Optional[APICategory] = None
    ) -> List[APIIntegration]:
        """
        Get list of available integrations
        
        Args:
            category: Filter by category (optional)
            
        Returns:
            List of integrations
        """
        integrations = list(self.integrations.values())
        
        if category:
            integrations = [i for i in integrations if i.category == category]
        
        # Sort by installation count (most popular first)
        integrations.sort(key=lambda x: x.installation_count, reverse=True)
        
        return integrations
    
    def install_integration(
        self,
        client_id: str,
        integration_id: str
    ) -> Dict[str, str]:
        """
        Install integration for client
        
        Args:
            client_id: Client identifier
            integration_id: Integration to install
            
        Returns:
            Installation configuration
        """
        integration = self.integrations.get(integration_id)
        if not integration:
            raise ValueError(f"Integration {integration_id} not found")
        
        # Increment installation count
        integration.installation_count += 1
        
        installation_config = {
            'client_id': client_id,
            'integration_id': integration_id,
            'status': 'active',
            'webhook_url': integration.webhook_url or '',
            'configuration_url': f"https://app.caas-platform.com/integrations/{integration_id}/configure"
        }
        
        logger.info("Installed %s for client %s", integration.name, client_id)
        return installation_config
    
    def _seed_integrations(self):
        """Seed marketplace with popular integrations"""
        default_integrations = [
            {
                'name': 'Salesforce CRM Sync',
                'category': APICategory.CRM,
                'provider': 'Salesforce',
                'description': 'Sync DAF compliance data with Salesforce CRM',
                'pricing_model': 'paid'
            },
            {
                'name': 'QuickBooks Integration',
                'category': APICategory.ACCOUNTING,
                'provider': 'Intuit',
                'description': 'Export compliance reports to QuickBooks',
                'pricing_model': 'freemium'
            },
            {
                'name': 'IRS 990 Data Feed',
                'category': APICategory.DATA,
                'provider': 'IRS ProPublica',
                'description': 'Real-time IRS 990 filing data',
                'pricing_model': 'free'
            },
            {
                'name': 'Slack Notifications',
                'category': APICategory.NOTIFICATION,
                'provider': 'Slack',
                'description': 'Real-time compliance alerts in Slack',
                'pricing_model': 'free'
            }
        ]
        
        for integration_data in default_integrations:
            self.register_integration(**integration_data)


# ==================== Usage Example ====================
if __name__ == "__main__":
    # Initialize platforms
    whitelabel = WhiteLabelPlatform()
    marketplace = APIMarketplace()
    
    print(f"\n{'='*70}")
    print("WHITE-LABEL PLATFORM DEMONSTRATION")
    print(f"{'='*70}\n")
    
    # Onboard partner
    branding = BrandingProfile(
        partner_id="PTR-001",
        company_name="Acme Compliance Services",
        logo_url="https://example.com/logo.png",
        primary_color="#0066CC",
        secondary_color="#003366",
        custom_domain="compliance.acme.com",
        email_from_name="Acme Compliance",
        email_from_address="support@acme.com"
    )
    
    partner = whitelabel.onboard_partner(
        company_name="Acme Compliance Services",
        tier=PartnerTier.RESELLER,
        branding=branding
    )
    
    print(f"✅ Onboarded Partner: {partner.company_name}")
    print(f"   Tier: {partner.tier.value}")
    print(f"   Revenue Share: {partner.revenue_share_percentage}%")
    print(f"   Portal URL: {whitelabel.generate_partner_portal_url(partner.partner_id)}")
    
    # Calculate commission
    client_subscription = 599.0  # Tier 2 subscription
    commission = whitelabel.calculate_commission(partner.partner_id, client_subscription)
    
    print(f"\n💰 Commission Calculation:")
    print(f"   Client Subscription: ${commission.transaction_amount:.2f}/month")
    print(f"   Commission ({commission.commission_percentage:.0%}): ${commission.commission_amount:.2f}")
    
    # Partner analytics
    partner.total_clients = 25
    analytics = whitelabel.get_partner_analytics(partner.partner_id)
    
    print(f"\n📊 Partner Analytics:")
    print(f"   Total Clients: {analytics['total_clients']}")
    print(f"   MRR: ${analytics['monthly_recurring_revenue']:,.2f}")
    print(f"   Commission YTD: ${analytics['commission_earned_ytd']:,.2f}")
    print(f"   Growth Potential: {analytics['growth_potential']}")
    
    # API Marketplace
    print(f"\n{'='*70}")
    print("API MARKETPLACE DEMONSTRATION")
    print(f"{'='*70}\n")
    
    # List integrations
    integrations = marketplace.get_integration_directory()
    print(f"📱 Available Integrations: {len(integrations)}")
    for integration in integrations:
        print(f"   • {integration.name} ({integration.category.value}) - {integration.pricing_model}")
    
    # Generate API key
    api_key, raw_key = marketplace.generate_api_key(
        partner_id=partner.partner_id,
        permissions=['read:clients', 'read:scans', 'write:reports']
    )
    print(f"\n🔑 Generated API Key: {raw_key[:20]}...")
    print(f"   Rate Limit: {api_key.rate_limit} requests/hour")
    print(f"   Permissions: {', '.join(api_key.permissions)}")
    
    # Install integration
    install_config = marketplace.install_integration('CLI-12345', 'INT-0002')
    print(f"\n✅ Installed Integration:")
    print(f"   Integration ID: {install_config['integration_id']}")
    print(f"   Status: {install_config['status']}")
    
    print(f"\n{'='*70}")
    print("REVENUE MULTIPLIER CALCULATION")
    print(f"{'='*70}\n")
    
    print("Scenario: 300 direct clients + 25 partners (avg 20 clients each)")
    print()
    print(f"Direct Revenue:")
    print(f"  300 clients × $500 avg = $150,000/month")
    print()
    print(f"Partner Revenue (White-Label):")
    print(f"  25 partners × 20 clients × $500 = $250,000/month")
    print(f"  CaaS share (80%): $200,000/month")
    print(f"  Partner commissions (20%): $50,000/month")
    print()
    print(f"Marketplace Revenue:")
    print(f"  500 integration installs × $20 avg × 30% = $3,000/month")
    print()
    print(f"TOTAL REVENUE: $353,000/month")
    print(f"vs Original Model: $150,000/month")
    print(f"Revenue Multiplier: 2.35x")
    print()
    print(f"💡 Competitive Advantage:")
    print(f"   ✅ 3 revenue streams (direct, white-label, marketplace)")
    print(f"   ✅ Network effects (partners bring clients, integrations add value)")
    print(f"   ✅ Ecosystem lock-in (high switching costs)")
    print(f"   ✅ Scalable without linear cost increase")
