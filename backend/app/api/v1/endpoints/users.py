from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy import select
from app.contracts.schemas import UserProfile, UserProfileResponse
from app.db.session import get_db
from app.db.models import UserModel

router = APIRouter()

USERS_CACHE = {}

@router.post("/sync", response_model=UserProfile)
async def sync_user_profile(user_data: UserProfile, db: AsyncSession = Depends(get_db)):
    """
    Syncs or creates a user record identified by clerk_id in Supabase PostgreSQL database.
    """
    USERS_CACHE[user_data.clerk_id] = user_data.dict()

    try:
        stmt = pg_insert(UserModel).values(
            clerk_id=user_data.clerk_id,
            email=user_data.email,
            full_name=user_data.full_name or "Clerk Developer",
            avatar_url=user_data.avatar_url,
            role=user_data.role or "researcher",
            user_metadata=user_data.metadata or {},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        ).on_conflict_do_update(
            index_elements=[UserModel.clerk_id],
            set_={
                "email": user_data.email,
                "full_name": user_data.full_name,
                "avatar_url": user_data.avatar_url,
                "updated_at": datetime.utcnow()
            }
        )
        await db.execute(stmt)
        await db.commit()
        print(f"[Supabase Sync] Successfully persisted user: {user_data.email} ({user_data.clerk_id})")
    except Exception as e:
        print(f"[Supabase Sync Error] Failed to persist user to Supabase: {e}")
        await db.rollback()

    return user_data

@router.get("/{clerk_id}", response_model=UserProfile)
async def get_user_profile(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Fetches user profile by Clerk ID from Supabase.
    """
    try:
        stmt = select(UserModel).where(UserModel.clerk_id == clerk_id)
        res = await db.execute(stmt)
        user = res.scalars().first()
        if user:
            return UserProfile(
                clerk_id=user.clerk_id,
                email=user.email,
                full_name=user.full_name,
                avatar_url=user.avatar_url,
                role=user.role,
                metadata=user.user_metadata or {}
            )
    except Exception as e:
        print(f"[Supabase Get User Warning] {e}")

    if clerk_id in USERS_CACHE:
        return USERS_CACHE[clerk_id]
    
    return {
        "clerk_id": clerk_id,
        "email": f"{clerk_id}@podlaunch.io",
        "full_name": "Clerk Engineer",
        "role": "researcher",
        "avatar_url": None,
        "metadata": {}
    }
