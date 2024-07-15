import random
import string
import uuid

def generate_unique_meeting_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

def generate_meeting_id():
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(4))

def generate_channel_name():
    return str(uuid.uuid4())
