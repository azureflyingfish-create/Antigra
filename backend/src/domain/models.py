from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from src.infrastructure.database import Base

class Title(Base):
    __tablename__ = "titles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    color = Column(String, nullable=True)
    
    members = relationship("Member", back_populates="title")

class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    title_id = Column(Integer, ForeignKey("titles.id"), nullable=True)
    
    title = relationship("Title", back_populates="members")
    assignments = relationship("Assignment", back_populates="member")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    assignments = relationship("Assignment", back_populates="project")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    percentage = Column(Integer)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    member = relationship("Member", back_populates="assignments")
    project = relationship("Project", back_populates="assignments")
