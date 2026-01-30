from fastapi import HTTPException
from ..config import GEMINI_API_KEY, APP_MODE

def gemini_summary(prompt: str):
    if APP_MODE != "real":
        raise HTTPException(status_code=403, detail="Gemini only available in REAL mode")
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API key missing")
    # TODO: Implement real Gemini API call
    raise HTTPException(status_code=501, detail="Gemini proxy not implemented yet")
