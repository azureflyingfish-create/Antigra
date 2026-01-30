from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# --- Titles ---
class TitleBase(BaseModel):
    name: str
    color: Optional[str] = None

class TitleCreate(TitleBase):
    pass

class Title(TitleBase):
    id: int
    class Config:
        from_attributes = True

# --- Members ---
class MemberBase(BaseModel):
    name: str
    title_id: Optional[int] = None

class MemberCreate(MemberBase):
    pass

class Member(MemberBase):
    id: int
    title: Optional[Title] = None
    class Config:
        from_attributes = True

# --- Projects ---
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    class Config:
        from_attributes = True

# --- Assignments ---
class AssignmentBase(BaseModel):
    member_id: int
    project_id: int
    percentage: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class AssignmentCreate(AssignmentBase):
    pass

class Assignment(AssignmentBase):
    id: int
    member: Optional[Member] = None # Optional for listing logic
    project: Optional[Project] = None
    class Config:
        from_attributes = True
