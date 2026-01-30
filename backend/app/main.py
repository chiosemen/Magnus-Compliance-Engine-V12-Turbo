from fastapi import FastAPI

import sys
import logging
from fastapi import FastAPI
from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext

from .db import Base, engine
from .models import SourceDocument, AuditEvent, LitigationHold, RiskFactor, RiskScore, RiskScoreComponent
from .config import APP_MODE, REDIS_URL
from .tasks import celery_app

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("startup")

def verify_alembic_state():
    """Fail startup if migrations are not up to date in production."""
    if APP_MODE != "production":
        # In dev, we can still use create_all for convenience, or skip verification
        Base.metadata.create_all(bind=engine)
        return

    logger.info("Verifying database schema revision...")
    alembic_cfg = Config("alembic.ini")
    script = ScriptDirectory.from_config(alembic_cfg)
    
    with engine.connect() as connection:
        context = MigrationContext.configure(connection)
        current_rev = context.get_current_revision()
        head_rev = script.get_current_head()
        
        if current_rev != head_rev:
            logger.error("FATAL: Database schema drift detected. Current: %s, Expected: %s", current_rev, head_rev)
            logger.error("Run 'alembic upgrade head' before starting the application.")
            sys.exit(1)
        logger.info("Schema verification passed: %s", current_rev)

def verify_worker_availability():
    """Verify background worker connectivity."""
    try:
        ping = celery_app.control.inspect().ping()
        if not ping:
            logger.warning("Worker availability check: No workers found via Redis.")
            if APP_MODE == "production":
                # In strict production, ingestion might need to be fail-closed here or handled at endpoint
                # For now, we log mostly, but could set a global flag
                pass
    except Exception as e:
        logger.error("Worker connectivity check failed: %s", e)
        # In production, we might want to hard fail if we can't talk to Redis at all
        if APP_MODE == "production":
             logger.error("FATAL: Cannot reach Redis broker.")
             sys.exit(1)

# Run validations
verify_alembic_state()
verify_worker_availability()

from .routers import health, auth, orgs, analysis, reports, audit, ingestion, ai, risk, clients
from .routers import caas_analysis, caas_remediation, caas_whistleblower
from .routers import tax_forms
from .routers import exports
from .routers import billing

app = FastAPI(title="Magnus Compliance Engine", openapi_url="/api/openapi.json")

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(orgs.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(ingestion.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(exports.router, prefix="/api/exports")
app.include_router(risk.router, prefix="/api")
app.include_router(clients.router)
app.include_router(caas_analysis.router)
app.include_router(caas_remediation.router)
app.include_router(caas_whistleblower.router)
app.include_router(tax_forms.router, prefix="/api")
app.include_router(billing.router, prefix="/api")
