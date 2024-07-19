from app.api import agoraTokenGeneration
from app.api import meetingRoom

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agoraTokenGeneration.router)
app.include_router(meetingRoom.router)

@app.get("/")
def home():
    return {"message": "Welcome to the Agora Token Service"}
