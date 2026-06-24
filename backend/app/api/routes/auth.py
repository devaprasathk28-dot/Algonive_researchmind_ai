from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.database.schemas import RegisterRequest, LoginRequest
from app.auth.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    res = register_user(
        db,
        request.name,
        request.email,
        request.password
    )
    if "error" in res:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["error"]
        )
    return res

@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    res = login_user(
        db,
        request.email,
        request.password
    )
    if "error" in res:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=res["error"]
        )
    return res

