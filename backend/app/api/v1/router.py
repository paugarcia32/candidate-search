from fastapi import APIRouter

from app.api.v1.candidates import router as candidates_router

router = APIRouter(prefix="/api/v1")
router.include_router(candidates_router)
