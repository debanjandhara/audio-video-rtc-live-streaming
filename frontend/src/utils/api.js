// import dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();

const BACKEND_SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL;

const headers = {
  'Content-Type': 'application/json',
};

// Function to check backend health
export async function checkBackendHealth() {
  const response = await fetch(`${BACKEND_SERVER_URL}/`, {
    method: 'GET',
    headers,
  });
  const data = await response.json();
  return data;
}

// Function to generate token
export async function generateToken(channelName, userName) {
  const response = await fetch(`${BACKEND_SERVER_URL}/token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ channelName, userName }),
  });
  const data = await response.json();
  return data;
}

// Function to check meeting API health
export async function checkMeetingApiHealth() {
  const response = await fetch(`${BACKEND_SERVER_URL}/meeting_api_health`, {
    method: 'POST',
    headers,
  });
  const data = await response.json();
  return data;


}

// Function to create a meeting
// export async function createMeeting(userId) {
//   const response = await fetch(`${BACKEND_SERVER_URL}/create_meeting`, {
//     method: 'POST',
//     headers,
//     body: JSON.stringify({ user_id: userId }),
//   });
//   console.log(`APi Side Respoce : ${response}`)
//   const data = await response.json();
//   return data;
// }

export async function createMeeting(userId) {
  try {
    const response = await fetch(`${BACKEND_SERVER_URL}/create_meeting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId }),
    });

    // Log the response status
    console.log(`Response status: ${response.status}`);

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Log the response data
    console.log(`API Response: ${JSON.stringify(data)}`);

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Function to add participant to a meeting
export async function addParticipant(participantID, meetingId) {
  const response = await fetch(`${BACKEND_SERVER_URL}/add_participant`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ participantID, meetingId }),
  });
  const data = await response.json();
  return data;
}

// Function to list participants
export async function listParticipants(meetingId) {
  const response = await fetch(`${BACKEND_SERVER_URL}/list_participant`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ meetingId }),
  });
  const data = await response.json();
  return data;
}

// Function to deny participant's request
export async function denyParticipant(userId, meetingLink) {
  const response = await fetch(`${BACKEND_SERVER_URL}/deny_participant`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ participantID: userId, meetingId: meetingLink }),
  });
  const data = await response.json();
  return data;
}

// Function to upgrade participant's request
export async function upgradeParticipant(userId, meetingLink) {
  const response = await fetch(`${BACKEND_SERVER_URL}/upgrade_participant`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ participantID: userId, meetingId: meetingLink }),
  });
  const data = await response.json();
  return data;
}

// Function to check if user is owner
export async function checkUserIsOwner(userId, meetingLink) {
  const response = await fetch(`${BACKEND_SERVER_URL}/check_user_is_owner`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ participantID: userId, meetingId: meetingLink }),
  });
  const data = await response.json();
  console.log(`API Response: ${JSON.stringify(data)}`);
  return data;
}

// Function to check user approval
export async function checkUserApproval(userId, meetingLink) {
  const response = await fetch(`${BACKEND_SERVER_URL}/check_user_approval`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ participantID: userId, meetingId: meetingLink }),
  });
  const data = await response.json();
  return data;
}
