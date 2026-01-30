from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from .config import JWT_SECRET, APP_MODE
from .models import Client
from .db import SessionLocal, get_db

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def get_client_by_email(db, email: str):
    return db.query(Client).filter(Client.email == email).first()

def authenticate_client(db, email: str, password: str):
    client = get_client_by_email(db, email)
    if not client:
        return False
    if not client.password_hash:
        return False
    if not verify_password(password, client.password_hash):
        return False
    return client

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    client = get_client_by_email(db, email=email)
    if client is None:
        raise credentials_exception
    return client

def require_user(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

def require_admin(user=Depends(get_current_user)):
    # Check if user has admin role in any membership
    from .models import Membership
    # Note: Using get_db directly or creating a new session. 
    # Since we are inside a dependency that already has a user (which required db), 
    # we might want to reuse db? But require_admin signature doesn't take db.
    # We can create a new session or change signature.
    # For now, let's create a new session safely.
    from .db import SessionLocal
    db = SessionLocal()
    try:
        memberships = db.query(Membership).filter(Membership.user_id == user.id).all()
        if not any(m.role == "admin" for m in memberships):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        return user
    finally:
        db.close()

