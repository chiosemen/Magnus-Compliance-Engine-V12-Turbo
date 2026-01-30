from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import User
from ..schemas import UserCreate, Token, User as UserSchema
from ..auth import authenticate_user, create_access_token, get_password_hash, get_user_by_email, require_user
from ..config import APP_MODE

router = APIRouter(prefix="/auth")

@router.post("/login", response_model=Token)
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_in.email, user_in.password)
    if not user:
        if APP_MODE == "demo" and user_in.email == "demo@demo.com" and user_in.password == "demo":
            # Create demo user if not exists
            user = get_user_by_email(db, "demo@demo.com")
            if not user:
                user = User(email="demo@demo.com", hashed_password=get_password_hash("demo"))
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
def me(user=Depends(require_user)):
    return user
