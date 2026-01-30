import os
import sys
import logging

# Configure logging for startup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("config")

APP_MODE = os.getenv("APP_MODE", "production").lower()

# Load critical secrets
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET")
PROPUBLICA_API_KEY = os.getenv("PROPUBLICA_API_KEY")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Strict Validation for Production/Staging
if APP_MODE not in ["demo", "test", "dev"]:
    missing_vars = []
    
    if not DATABASE_URL:
        missing_vars.append("DATABASE_URL")
    elif "sqlite" in DATABASE_URL:
        logger.error("FATAL: SQLite is not permitted in production.")
        sys.exit(1)
        
    if not JWT_SECRET:
        missing_vars.append("JWT_SECRET")
    elif JWT_SECRET == "dev-secret":
        missing_vars.append("JWT_SECRET (Using default is forbidden)")
    elif len(JWT_SECRET) < 32:
        logger.error("FATAL: JWT_SECRET must be at least 32 characters long.")
        sys.exit(1)

    if missing_vars:
        logger.error(f"FATAL: Missing critical configuration for {APP_MODE} mode: {', '.join(missing_vars)}")
        sys.exit(1)

# Fallbacks for NON-PRODUCTION modes only
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./db.sqlite3"
    logger.warning("Using SQLite (Non-Production Mode)")

if not JWT_SECRET:
    JWT_SECRET = "dev-secret"
    logger.warning("Using default JWT_SECRET (Non-Production Mode)")
