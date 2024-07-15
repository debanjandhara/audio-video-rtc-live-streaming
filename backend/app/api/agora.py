from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.agora_utils import generate_token
from app.models.agora_models import TokenRequest
import os

router = APIRouter()

@router.post("/token")
def get_token(request: TokenRequest):
    app_id = os.getenv("AGORA_APP_ID")
    app_certificate = os.getenv("AGORA_APP_CERTIFICATE")
    
    if not app_id or not app_certificate:
        raise HTTPException(status_code=500, detail="AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables must be set")

    token = generate_token(request.channelName, request.userName)

    return {"token": token}
