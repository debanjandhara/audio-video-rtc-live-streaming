import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), './')))

from src.RtcTokenBuilder2 import *

import os
app_id = os.getenv("AGORA_APP_ID")
app_certificate = os.getenv("AGORA_APP_CERTIFICATE")

def generate_token(channel_name, user_name, app_id = app_id, app_certificate = app_certificate):
    token_expire = 300  #  in seconds
    privilege_expire = 300 #  in seconds

    # Role_Publisher = 1: A broadcaster (host) in a live-broadcast profile. Role_Subscriber = 2: (Default) A audience in a live-broadcast profile.
    role = 1

    # Use with Username (String)
    token = RtcTokenBuilder.build_token_with_user_account(app_id, app_certificate, channel_name, user_name, role,
                                                             token_expire, privilege_expire)
    
    # Use with UserID (Integer)
    # token = RtcTokenBuilder.buildTokenWithUid(app_id, app_certificate, channel_name, user_name, role, privilegeExpireTs)
    
    print(f"New Request Made with Channel Name : {channel_name}, User Name : {user_name} , and the Token : {token}")

    return token
