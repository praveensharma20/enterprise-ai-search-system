from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    full_name: str
    email: EmailStr
    hashed_password: Optional[str] = None
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "full_name": "Praveen Sharma",
                "email": "praveenjit8484@gmail.com",
                "is_active": True
            }
        }

class UserInDB(User):
    hashed_password: str
