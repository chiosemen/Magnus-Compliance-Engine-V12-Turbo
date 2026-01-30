from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Org, Membership
from ..schemas import OrgCreate, Org
from ..auth import require_user
from ..utils.input_validation import validate_int_list

router = APIRouter(prefix="/orgs")

@router.post("", response_model=Org)
def create_org(org_in: OrgCreate, db: Session = Depends(get_db), user=Depends(require_user)):
    org = Org(name=org_in.name)
    db.add(org)
    db.commit()
    db.refresh(org)
    membership = Membership(user_id=user.id, org_id=org.id, role="owner")
    db.add(membership)
    db.commit()
    return org

@router.get("", response_model=list[Org])
def list_orgs(db: Session = Depends(get_db), user=Depends(require_user)):
    memberships = db.query(Membership).filter(Membership.user_id == user.id).all()
    org_ids = [m.org_id for m in memberships]
    # Validate org_ids to prevent SQL injection
    if org_ids:
        validated_org_ids = validate_int_list(org_ids)
        return db.query(Org).filter(Org.id.in_(validated_org_ids)).all()
    return []
