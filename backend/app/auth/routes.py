from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
from bson import ObjectId
import logging
import traceback
import os

from .schemas import UserSignup, UserLogin, Token
from .models import User, UserInDB
from .utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# ✅ STANDALONE DATABASE CONNECTION
def get_database():
    """Get MongoDB database - standalone connection"""
    from motor.motor_asyncio import AsyncIOMotorClient
    
    # Get settings directly
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "document_search")
    
    logger.info(f"🔗 Connecting to MongoDB: {mongodb_url}")
    logger.info(f"📦 Database: {database_name}")
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    return db

# Create database connection
db = get_database()
logger.info(f"✅ Auth routes database initialized")

@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """Register a new user."""
    
    try:
        logger.info(f"📝 Signup attempt for email: {user_data.email}")
        logger.info(f"🔍 Database object: {db}")
        
        # Check if user already exists
        logger.info("🔍 Checking if user exists...")
        existing_user = await db.users.find_one({"email": user_data.email})
        
        if existing_user:
            logger.warning(f"⚠️ Email already registered: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        logger.info("🔐 Hashing password...")
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        logger.info("📄 Creating user document...")
        # Create user document
        user_dict = {
            "full_name": user_data.full_name,
            "email": user_data.email,
            "hashed_password": hashed_password,
            "google_id": None,
            "profile_picture": None,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        logger.info("💾 Inserting into database...")
        # Insert into database
        result = await db.users.insert_one(user_dict)
        
        logger.info(f"✅ User created successfully with ID: {result.inserted_id}")
        
        return {
            "message": "User created successfully",
            "user_id": str(result.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Signup error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user and return JWT token."""
    
    try:
        logger.info(f"🔑 Login attempt for email: {credentials.email}")
        
        # Find user by email
        user = await db.users.find_one({"email": credentials.email})
        
        if not user:
            logger.warning(f"⚠️ User not found: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Verify password
        if not verify_password(credentials.password, user.get("hashed_password", "")):
            logger.warning(f"⚠️ Invalid password for: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]},
            expires_delta=access_token_expires
        )
        
        logger.info(f"✅ Login successful for: {credentials.email}")
        
        # Return token and user info
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "full_name": user["full_name"],
                "email": user["email"],
                "profile_picture": user.get("profile_picture")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

@router.get("/me")
async def get_current_user(email: str = Depends(verify_token)):
    """Get current authenticated user."""
    
    try:
        logger.info(f"👤 Fetching user data for: {email}")
        
        user = await db.users.find_one({"email": email})
        
        if not user:
            logger.warning(f"⚠️ User not found: {email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"✅ User data retrieved for: {email}")
        
        return {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "email": user["email"],
            "profile_picture": user.get("profile_picture"),
            "created_at": user["created_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching user: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )

@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)."""
    logger.info("👋 User logged out")
    return {"message": "Logged out successfully"}

@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth login."""
    logger.info("🔍 Google OAuth login requested")
    return {"message": "Google OAuth will be configured soon"}

@router.get("/google/callback")
async def google_callback():
    """Handle Google OAuth callback."""
    logger.info("🔍 Google OAuth callback received")
    return {"message": "Google OAuth will be configured soon"}
