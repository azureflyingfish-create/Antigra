from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from src.infrastructure.database import get_db
from src.domain import models, schemas

router = APIRouter()

# --- Titles ---
@router.post("/titles/", response_model=schemas.Title)
async def create_title(title: schemas.TitleCreate, db: AsyncSession = Depends(get_db)):
    db_title = models.Title(name=title.name, color=title.color)
    db.add(db_title)
    await db.commit()
    await db.refresh(db_title)
    return db_title

@router.get("/titles/", response_model=List[schemas.Title])
async def read_titles(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Title).offset(skip).limit(limit))
    return result.scalars().all()

@router.delete("/titles/{title_id}")
async def delete_title(title_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Title).where(models.Title.id == title_id))
    title = result.scalar_one_or_none()
    if not title:
        raise HTTPException(status_code=404, detail="Title not found")
    await db.delete(title)
    await db.commit()
    return {"ok": True}

# --- Members ---
@router.post("/members/", response_model=schemas.Member)
async def create_member(member: schemas.MemberCreate, db: AsyncSession = Depends(get_db)):
    db_member = models.Member(**member.dict())
    db.add(db_member)
    await db.commit()
    await db.refresh(db_member)
    return db_member

@router.get("/members/", response_model=List[schemas.Member])
async def read_members(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Member).options(selectinload(models.Member.title)).offset(skip).limit(limit))
    return result.scalars().all()

@router.put("/members/{member_id}", response_model=schemas.Member)
async def update_member(member_id: int, member_update: schemas.MemberCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Member).where(models.Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    for key, value in member_update.dict().items():
        setattr(member, key, value)
    await db.commit()
    await db.refresh(member)
    return member

@router.delete("/members/{member_id}")
async def delete_member(member_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Member).where(models.Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    await db.delete(member)
    await db.commit()
    return {"ok": True}

# --- Projects ---
@router.post("/projects/", response_model=schemas.Project)
async def create_project(project: schemas.ProjectCreate, db: AsyncSession = Depends(get_db)):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.get("/projects/", response_model=List[schemas.Project])
async def read_projects(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Project).offset(skip).limit(limit))
    return result.scalars().all()

@router.put("/projects/{project_id}", response_model=schemas.Project)
async def update_project(project_id: int, project_update: schemas.ProjectCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Project).where(models.Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in project_update.dict().items():
        setattr(project, key, value)
    await db.commit()
    await db.refresh(project)
    return project

@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Project).where(models.Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    return {"ok": True}

# --- Assignments ---
@router.post("/assignments/", response_model=schemas.Assignment)
async def create_assignment(assignment: schemas.AssignmentCreate, db: AsyncSession = Depends(get_db)):
    db_assignment = models.Assignment(**assignment.dict())
    db.add(db_assignment)
    await db.commit()
    await db.refresh(db_assignment)
    return db_assignment

@router.put("/assignments/{assignment_id}", response_model=schemas.Assignment)
async def update_assignment(assignment_id: int, assignment_update: schemas.AssignmentCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Assignment).where(models.Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Update fields. Note: assignment_update is AssignmentCreate which has all fields. 
    # In a real app we might want a specific AssignmentUpdate schema, but for now we replace.
    assignment.percentage = assignment_update.percentage
    if assignment_update.start_date is not None:
         assignment.start_date = assignment_update.start_date
    if assignment_update.end_date is not None:
         assignment.end_date = assignment_update.end_date

    await db.commit()
    await db.refresh(assignment)
    return assignment

@router.get("/assignments/", response_model=List[schemas.Assignment])
async def read_assignments(db: AsyncSession = Depends(get_db)):
    # In real world, filter by project_id or member_id
    result = await db.execute(
        select(models.Assignment)
        .options(
            selectinload(models.Assignment.member).selectinload(models.Member.title),
            selectinload(models.Assignment.project)
        )
    )
    return result.scalars().all()

@router.delete("/assignments/{assignment_id}")
async def delete_assignment(assignment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Assignment).where(models.Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    await db.delete(assignment)
    await db.commit()
    return {"ok": True}
