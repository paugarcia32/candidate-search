from fastapi import APIRouter, HTTPException, status

from app.schemas.candidate import (
    CandidateCreate,
    CandidateUpdate,
    CandidatePatch,
    CandidateResponse,
    CandidatePage,
    SearchRequest,
)
import app.services.candidates as svc
import app.services.search as search_svc

router = APIRouter(prefix="/candidates", tags=["candidates"])


@router.get("", response_model=CandidatePage, status_code=200)
def list_candidates(limit: int = 20, offset: int = 0):
    return svc.list_candidates(limit, offset)


@router.post("", response_model=CandidateResponse, status_code=201)
def create_candidate(body: CandidateCreate):
    return svc.create_candidate(body)


@router.post("/search", response_model=list[CandidateResponse], status_code=200)
def search(body: SearchRequest):
    return search_svc.search_candidates(body.query, body.top_k)


@router.get("/{candidate_id}", response_model=CandidateResponse, status_code=200)
def get_candidate(candidate_id: str):
    candidate = svc.get_candidate(candidate_id)
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.put("/{candidate_id}", response_model=CandidateResponse, status_code=200)
def update_candidate(candidate_id: str, body: CandidateUpdate):
    candidate = svc.update_candidate(candidate_id, body)
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.patch("/{candidate_id}", response_model=CandidateResponse, status_code=200)
def patch_candidate(candidate_id: str, body: CandidatePatch):
    candidate = svc.patch_candidate(candidate_id, body)
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.delete("/{candidate_id}", status_code=204)
def delete_candidate(candidate_id: str):
    deleted = svc.delete_candidate(candidate_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Candidate not found")
