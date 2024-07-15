from fastapi import FastAPI
from app.api import agora, meeting_scheduling

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agora.router)
app.include_router(meeting_scheduling.router)

@app.get("/")
def home():
    return {"message": "Welcome to the Agora Token Service"}
