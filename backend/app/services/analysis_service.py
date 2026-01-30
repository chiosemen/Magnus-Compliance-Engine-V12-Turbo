from ..config import APP_MODE
from datetime import datetime
from ..utils.time_utils import now_utc

def perform_analysis(ein, org_id, simulated=False):
    if APP_MODE == "real" and simulated:
        raise Exception("Simulation not allowed in REAL mode")
    # In REAL mode, do real analysis (stubbed here)
    if APP_MODE == "real":
        # TODO: Replace with real logic
        return {
            "risk_score": 42,
            "factors": ["real factor 1", "real factor 2"],
            "provenance": {"data_sources": ["irs"], "computed_at": now_utc().isoformat(), "version": "1.0"},
            "simulated": False,
        }
    # DEMO mode: simulated
    return {
        "risk_score": 80,
        "factors": ["simulated factor"],
        "provenance": {"data_sources": ["simulated"], "computed_at": now_utc().isoformat(), "version": "demo"},
        "simulated": True,
    }
