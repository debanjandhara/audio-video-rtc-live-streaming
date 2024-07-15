import os
from datetime import datetime, timezone

from sqlalchemy import create_engine, Column, String, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

import os
DATABASE_URL = os.getenv("DATABASE_URL")

Base = declarative_base()

class Meeting(Base):
    __tablename__ = 'meetings'
    meetingId = Column(String, primary_key=True, unique=True)
    channelName = Column(String, unique=True)
    ownerID = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    participants = relationship('Participant', backref='meeting')

class Participant(Base):
    __tablename__ = 'participants'
    participantID = Column(String, primary_key=True, unique=True)
    meetingId = Column(String, ForeignKey('meetings.meetingId'))
    channelName = Column(String)
    approvalStatus = Column(String, default='pending')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


from pydantic import BaseModel

class CreateMeeting(BaseModel):
    user_id: str

class ParticipantClass(BaseModel):
    participantID: str
    meetingId: str

class ListParticipants(BaseModel):
    meetingId: str
