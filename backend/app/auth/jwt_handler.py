from jose import jwt
from datetime import datetime, timedelta
from app.core.settings import settings

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = "HS256"

def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=7)
    payload = {
        "sub": str(user_id),
        "exp": expire
    }
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
