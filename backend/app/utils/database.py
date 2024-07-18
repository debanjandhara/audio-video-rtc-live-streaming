from fastapi import Depends
from sqlalchemy.orm import Session

from app.models.meetingModels import Base, Meeting, Participant, engine, SessionLocal
from app.utils.others import generate_meeting_id, generate_channel_name
from app.utils.agoraUtils import generate_token

from datetime import datetime, timedelta
from app.models.meetingMgmtDB import *



# ----------------------------------------------


import csv
from app.models.meetingModels import Meeting, Participant


def get_db_for_extract():
    db = SessionLocal()
    try:
        yield db
        extract_db_to_csv()
    finally:
        db.close()

def extract_db_to_csv():
    db = next(get_db_for_extract())
    
    # Extract meetings data
    meetings = db.query(Meeting).all()
    with open('meetings.csv', 'w', newline='') as csvfile:
        fieldnames = ['meetingId', 'channelName', 'ownerID', 'created_at']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for meeting in meetings:
            writer.writerow({
                'meetingId': meeting.meetingId,
                'channelName': meeting.channelName,
                'ownerID': meeting.ownerID,
                'created_at': meeting.created_at
            })
    
    # Extract participants data
    participants = db.query(Participant).all()
    with open('participants.csv', 'w', newline='') as csvfile:
        fieldnames = ['participantID', 'meetingId', 'channelName', 'approvalStatus']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for participant in participants:
            writer.writerow({
                'participantID': participant.participantID,
                'meetingId': participant.meetingId,
                'channelName': participant.channelName,
                'approvalStatus': participant.approvalStatus
            })
    
    db.close()


# ---------- Main Code Starts Here -------------

def get_db():
    db = SessionLocal()
    try:
        yield db
        extract_db_to_csv()
    finally:
        db.close()

def add_participant(participantID: str, meetingId: str, db: Session = Depends(get_db)):
    # Ensure meeting ID exists and get the channel name
    approvalStatus = 'pending'
    meeting = db.query(Meeting).filter(Meeting.meetingId == meetingId).first()
    if meeting:
        participant = db.query(Participant).filter(
            Participant.participantID == participantID,
            Participant.meetingId == meetingId
        ).first()
        if participant:
            if participant.approvalStatus == 'denied':
                participant.approvalStatus = 'pending'
                db.commit()
                db.refresh(participant)
                return "Success - Status Updated to Pending"
            else:
                return "Failure - Participant Already Exists"
        else:
            participant = Participant(
                participantID=participantID,
                meetingId=meetingId,
                channelName=meeting.channelName,
                approvalStatus=approvalStatus
            )
            db.add(participant)
            db.commit()
            db.refresh(participant)
            return "Success"
    else:
        return "Failure - No Meeting ID"

def list_participants(meetingId: str, db: Session = Depends(get_db)):
    participants = db.query(Participant).filter(
        Participant.meetingId == meetingId,
        Participant.approvalStatus == 'pending'
    ).all()
    participant_ids = [participant.participantID for participant in participants]
    return participant_ids

def upgrade_participant(participantID: str, meetingLink: str, db: Session = Depends(get_db)):
    participant = db.query(Participant).filter(Participant.participantID == participantID, Participant.meetingId == meetingLink).first()
    if participant:
        participant.approvalStatus = 'approved'
        db.commit()
        db.refresh(participant)
        return "Success"
    else:
        return "Failure - Either Meeting ID Wrong / Participants not in meeting"

def deny_participant(participantID: str, meetingLink: str, db: Session = Depends(get_db)):
    participant = db.query(Participant).filter(Participant.participantID == participantID, Participant.meetingId == meetingLink).first()
    if participant:
        participant.approvalStatus = 'denied'
        db.commit()
        db.refresh(participant)
        return "Success"
    else:
        return "Failure - Either Meeting ID Wrong / Participants not in meeting"

def delete_old_meetings(db: Session = Depends(get_db)):
    limit_date = datetime.now() - timedelta(days=0)             # Seven Days if the Limit
    old_meetings = db.query(Meeting).filter(Meeting.created_at < limit_date).all()
    old_meeting_ids = [meeting.meetingId for meeting in old_meetings]

    for meeting_id in old_meeting_ids:
        # Delete participants
        db.query(Participant).filter(Participant.meetingId == meeting_id).delete()
        # Delete meeting
        db.query(Meeting).filter(Meeting.meetingId == meeting_id).delete()

    db.commit()
    return "Success"

def check_user_is_owner_n_get_token(userId: str, meetingId: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.meetingId == meetingId).first()
    if meeting:
        if meeting.ownerID == userId:
            channel_name = meeting.channelName
            print(f"User {userId} is the owner of meeting {meetingId}.")
            token = generate_token(channel_name, userId)
            return {"token": token, "channelName": channel_name}
        else:
            return {"token": "false", "channelName": ""}

def check_user_approval_n_get_token(participantID: str, meetingId: str, db: Session = Depends(get_db)):
    participant = db.query(Participant).filter(Participant.participantID == participantID, Participant.meetingId == meetingId).first()
    if participant:
        if participant.approvalStatus == 'approved':
            channel_name = participant.channelName
            print(f"User {participantID} is the owner of meeting {meetingId}.")
            token = generate_token(channel_name, participantID)
            return {"token": token, "channelName": channel_name}
        
        elif participant.approvalStatus == 'denied':
            return {"token": "denied", "channelName": ""}
        
        elif participant.approvalStatus == 'pending':
            return {"token": "pending", "channelName": ""}

        else:
            print(f"Participant {participantID} is not approved for meeting {meetingId}.")
            return "Request Failed - Check Console Logs"
    else:
        print(f"Participant {participantID} not found in meeting {meetingId}.")
        return f"Request Failed - Participant {participantID} not found in meeting {meetingId}."

def add_meeting(user_id: str, db: Session = Depends(get_db)):
    while True:
        meeting_id = generate_meeting_id()
        existing_meeting = db.query(Meeting).filter(Meeting.meetingId == meeting_id).first()
        if not existing_meeting:
            break

    channel_name = generate_channel_name()
    meeting = Meeting(meetingId=meeting_id, channelName=channel_name, ownerID=user_id)
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return {"meeting_id": meeting.meetingId}

def get_participants_by_meeting(meetingId: str, db: Session = Depends(get_db)):
    return db.query(Participant).filter(Participant.meetingId == meetingId).all()
