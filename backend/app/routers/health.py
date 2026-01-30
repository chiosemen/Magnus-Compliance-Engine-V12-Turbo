from fastapi import APIRouter
from ..config import APP_MODE
from ..db import engine

router = APIRouter()

@router.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        db_status = "ok"
    except Exception:
        db_status = "fail"
    return {"status": "ok", "mode": APP_MODE, "db": db_status}
