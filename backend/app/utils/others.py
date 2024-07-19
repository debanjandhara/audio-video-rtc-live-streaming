import random
import string
import uuid

def generate_meeting_id():
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(4))

def generate_channel_name():
    return str(uuid.uuid4())
