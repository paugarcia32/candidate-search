from __future__ import annotations
from pydantic import BaseModel
from typing import Optional


class ExperienceItem(BaseModel):
    company: str
    role: str
    start: str
    end: Optional[str] = None
    description: str


class EducationItem(BaseModel):
    institution: str
    degree: str
    start: str
    end: Optional[str] = None


class CertificationItem(BaseModel):
    name: str
    issuer: str
    year: Optional[int] = None


class CandidateCreate(BaseModel):
    id: Optional[str] = None
    name: str
    photo: Optional[str] = ""
    location: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    summary: str
    experience: list[ExperienceItem] = []
    education: list[EducationItem] = []
    certifications: list[CertificationItem] = []


class CandidateUpdate(BaseModel):
    name: str
    photo: Optional[str] = ""
    location: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    summary: str
    experience: list[ExperienceItem] = []
    education: list[EducationItem] = []
    certifications: list[CertificationItem] = []


class CandidatePatch(BaseModel):
    name: Optional[str] = None
    photo: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[list[ExperienceItem]] = None
    education: Optional[list[EducationItem]] = None
    certifications: Optional[list[CertificationItem]] = None


class CandidateResponse(BaseModel):
    id: str
    name: str
    photo: str
    location: str
    email: str
    phone: str
    summary: str
    experience: list[ExperienceItem]
    education: list[EducationItem]
    certifications: list[CertificationItem]
    score: Optional[float] = None


class CandidatePage(BaseModel):
    items: list[CandidateResponse]
    total: int
    limit: int
    offset: int


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    min_score: Optional[float] = None
    location: Optional[str] = None
