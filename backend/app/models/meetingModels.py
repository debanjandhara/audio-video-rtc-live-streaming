from pydantic import BaseModel

class CreateMeeting(BaseModel):
    user_id: str

class ParticipantClass(BaseModel):
    participantID: str
    meetingId: str

class ListParticipants(BaseModel):
    meetingId: str
