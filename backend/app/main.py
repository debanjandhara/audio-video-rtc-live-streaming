from fastapi import FastAPI
from app.api import agora
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

app.include_router(agora.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Agora Token Service"}