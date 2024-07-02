from pydantic import BaseModel

class TokenRequest(BaseModel):
    channelName: str
    userName: str
