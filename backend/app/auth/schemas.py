from pydantic import BaseModel, Field
from typing import Optional

class UserSignup(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    # Use plain str for email to avoid dependency mismatch with email-validator
    email: str = Field(..., min_length=5, max_length=320)
    password: str = Field(..., min_length=8)
    
    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Praveen Sharma",
                "email": "praveen@example.com",
                "password": "SecurePass123"
            }
        }

class UserLogin(BaseModel):
    email: str
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "praveenjit8484@gmail.com",
                "password": "SecurePass123"
            }
        }

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None
