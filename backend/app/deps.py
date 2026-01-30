from fastapi import Depends, HTTPException
from .config import APP_MODE

def require_real_mode():
    if APP_MODE != "real":
        raise HTTPException(status_code=403, detail="Endpoint only available in REAL mode")

def require_demo_mode():
    if APP_MODE != "demo":
        raise HTTPException(status_code=403, detail="Endpoint only available in DEMO mode")
