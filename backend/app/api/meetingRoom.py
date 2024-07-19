from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.meetingModels import *
from app.models.meetingMgmtDB import *
from app.utils.database import *

router = APIRouter()

@router.post("/meeting_api_health")
def meeting_api_health():
    return {"Smiling Face" : "😀"}

@router.post("/create_meeting")
def api_create_meeting(request: CreateMeeting, db: Session = Depends(get_db)):
    return add_meeting(user_id=request.user_id, db=db)

@router.post("/add_participant")
def api_add_participant(request: ParticipantClass, db: Session = Depends(get_db)):
    return {"message": f"{add_participant(request.participantID, request.meetingId, db)}"}

@router.post("/list_participant")
def api_list_participant(request: ListParticipants, db: Session = Depends(get_db)):
    return {"message": f"{list_participants(request.meetingId, db)}"}

@router.post("/deny_participant")
def api_deny_participant(request: ParticipantClass, db: Session = Depends(get_db)):
    return {"message": f"{deny_participant(request.participantID, request.meetingId, db)}"}

@router.post("/upgrade_participant")
def api_upgrade_participant(request: ParticipantClass, db: Session = Depends(get_db)):
    return {"message": f"{upgrade_participant(request.participantID, request.meetingId, db)}"}

@router.post("/check_user_is_owner")
def api_check_user_is_owner(request: ParticipantClass, db: Session = Depends(get_db)):
    return check_user_is_owner_n_get_token(request.participantID, request.meetingId, db)

@router.post("/check_user_approval")
def api_check_user_approval(request: ParticipantClass, db: Session = Depends(get_db)):
    return check_user_approval_n_get_token(request.participantID, request.meetingId, db)

# SPECIAL FUNCTION TO CLEAN ALL THE EXTRA MEETING IDs - to know more Read : backend\app\utils\database.py ; Function : delete_old_meetings()
@router.delete("/delete_old_meetings")
def api_delete_old_meetings(db: Session = Depends(get_db)):
    return {"message": f"{delete_old_meetings(db)}"} 