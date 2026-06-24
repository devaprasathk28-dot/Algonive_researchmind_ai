from sqlalchemy.orm import Session
from app.database.models import User
from app.auth.password_handler import hash_password, verify_password
from app.auth.jwt_handler import create_access_token

def register_user(db: Session, name, email, password):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return {"error": "Email already exists"}
        
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Registration successful"}

def login_user(db: Session, email, password):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"error": "User not found"}
        
    valid = verify_password(password, user.password_hash)
    if not valid:
        return {"error": "Invalid credentials"}
        
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "user_id": user.id
    }
