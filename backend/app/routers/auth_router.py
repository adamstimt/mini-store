from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.security import verify_password, create_access_token

router = APIRouter(
    tags=["Authentication"]
)

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Hawes 3la l-user b l-email wela l-username b zouj
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email wela Mot de passe ghalat!",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Creyi l-Access Token
    access_token = create_access_token(data={"sub": user.email})
    
    # Returni l-token m3a is_admin b njaḥ 🚀
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_admin": user.is_admin
    }