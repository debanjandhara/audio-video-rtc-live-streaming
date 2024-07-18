import '../styles/tailwind.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { checkUserApproval, checkUserIsOwner, addParticipant, denyParticipant, listParticipants, upgradeParticipant } from '../utils/api';
import AgoraAudioCallFunctions from './AgoraAudioCallFunctions';

const AudioCallRoom = ({ meetingLink, userId }) => {
    const { meetingLink } = useParams();
    const userId = localStorage.getItem('userId');
    const [isApproved, setIsApproved] = useState(false);
    const [token, setToken] = useState('');
    // const [channelName, setChannelName] = useState('');
    const [statusMessage, setStatusMessage] = useState('Checking user status...');
    const [participants, setParticipants] = useState([]);

    const [isMuted, setIsMuted] = useState(true);
    const [stream, setStream] = useState(null);

    const {
        rtc,
        remoteUsers,
        joined,
        channelName,
        setChannelName,
        sessionId,
        setSessionId,
        joinChannel,
        leaveChannel,
        // toggleMute,
        // isMuted,
    } = AgoraAudioCallFunctions();

    useEffect(() => {
        const getMicrophoneAccess = async () => {
            try {
                const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setStream(micStream);
            } catch (error) {
                console.error('Error accessing the microphone:', error);
            }
        };

        getMicrophoneAccess();
    }, []);

    const toggleMicrophone = () => {
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => (track.enabled = isMuted));
            setIsMuted(!isMuted);
        }
    };




    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const response = await checkUserIsOwner(userId, meetingLink);
                if (response && response.channelName) {
                    setToken(response.token);
                    localStorage.setItem('token', response.token);
                    setChannelName(response.channelName);
                    // setAudioCallChannelName(response.channelName);
                    setSessionId(userId);
                    setStatusMessage('User is the owner. Token and ChannelName retrieved.');
                    console.log("Token:", response.token);
                    console.log("Channel Name:", response.channelName);
                    setIsApproved(true);
                    joinChannel(response.channelName, userId);
                    listParticipantsHandler(); // Load participants list for owner
                    setInterval(listParticipantsHandler, 1000); // Poll participants every second
                } else {
                    setStatusMessage('User is not the owner. Checking approval status...');
                    await addParticipant(userId, meetingLink);
                    checkUserApprovalStatus();
                }
            } catch (error) {
                console.error("Error checking user status:", error);
                setStatusMessage('Error checking user status.');
            }
        };

        const checkUserApprovalStatus = async () => {
            const timeout = 300000; // After 5 mins, deny the participant
            const startTime = Date.now();

            const interval = setInterval(async () => {
                try {
                    const response = await checkUserApproval(userId, meetingLink);
                    console.log('User : ', userId);
                    console.log('meetingLink : ', meetingLink);
                    console.log('checkUserApproval response : ', response);
                    if (response && response.channelName) {
                        setToken(response.token);
                        localStorage.setItem('token', response.token);
                        setChannelName(response.channelName);
                        // setAudioCallChannelName(response.channelName);
                        setSessionId(userId);
                        setIsApproved(true);
                        setStatusMessage('User approved. Token and ChannelName retrieved.');
                        console.log("Token:", response.token);
                        console.log("Channel Name:", response.channelName);
                        joinChannel(response.channelName, userId);
                        clearInterval(interval);
                        listParticipantsHandler(); // Load participants list for owner
                    } else if (Date.now() - startTime > timeout) {
                        setStatusMessage('User request exhausted.');
                        console.log("User request exhausted");
                        clearInterval(interval);
                        await denyParticipant(userId, meetingLink);
                    } else if (response && response.token === 'denied') {
                        setStatusMessage('User request denied. Please rejoin or refresh the page.');
                        clearInterval(interval);
                    } else if (response && response.token === 'pending') {
                        setStatusMessage('User request is pending approval.');
                    } else if (response && response.token === 'approved') {
                        setStatusMessage('User request is approved.');
                    } else {
                        setStatusMessage('User waiting for approval.');
                        console.log("User waiting for approval.");
                    }
                } catch (error) {
                    console.error("Error checking user approval:", error);
                    clearInterval(interval);
                    setStatusMessage('Error checking user approval.');
                }
            }, 2000);
        };

        const listParticipantsHandler = async () => {
            try {
                const response = await listParticipants(meetingLink);
                if (response && response.message) {
                    const participantsList = JSON.parse(response.message.replace(/'/g, '"'));
                    setParticipants(participantsList);
                } else {
                    console.log("No participants found.");
                    setParticipants([]);
                }
            } catch (error) {
                console.error("Error listing participants:", error);
                setParticipants([]);
            }
        };

        checkUserStatus();
    }, [meetingLink, userId]);

    const handleAcceptParticipant = async (participantId) => {
        try {
            await upgradeParticipant(participantId, meetingLink);
            // Remove the accepted participant from the list
            setParticipants(participants.filter(p => p !== participantId));
        } catch (error) {
            console.error("Error accepting participant:", error);
        }
    };

    const handleDenyParticipant = async (participantId) => {
        try {
            await denyParticipant(participantId, meetingLink);
            // Remove the denied participant from the list
            setParticipants(participants.filter(p => p !== participantId));
        } catch (error) {
            console.error("Error denying participant:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold mb-4">Audio Call Testing</h2>
                <p className="mb-2">Meeting ID: {meetingLink}</p>
                <p className="mb-4">User ID: {userId}</p>
                <p className="mb-4">{statusMessage}</p>
                {isApproved ? (
                    <div className="meeting-zone">
                        <h2 className="text-xl font-semibold mb-2">Meeting Zone</h2>
                        {/* Render your meeting components here */}
                    </div>
                ) : (
                    <div className="waiting-zone">
                        <h2 className="text-xl font-semibold mb-2">Waiting Zone</h2>
                        <p>Please wait for approval...</p>
                    </div>
                )}
            </div>
            {channelName && token && (
                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2 lg:w-1/3 mt-4">
                    <h2 className="text-xl font-semibold mb-2">Inside meeting room</h2>
                    {/* <p className="mb-2">Channel Name: {channelName}</p>
                    <p className="mb-2">Token: {token}</p> */}
                    <button
                        onClick={toggleMicrophone}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        {isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    </button>
                    <button
                        onClick={leaveChannel}
                        className={`px-4 py-2 rounded ${!joined ? 'bg-gray-300' : 'bg-red-500 text-white hover:bg-red-700'}`}
                    >
                        Leave Channel
                    </button>

                </div>
            )}

            {/* Conditional div for owner actions */}
            {isApproved && participants.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2 lg:w-1/3 mt-4">
                    <h2 className="text-xl font-semibold mb-2">Participant Management</h2>
                    {participants.map(participant => (
                        <div key={participant} className="flex items-center justify-between mb-2">
                            <p>{participant}</p>
                            <div>
                                <button className="bg-green-500 text-white px-4 py-2 mr-2 rounded"
                                    onClick={() => handleAcceptParticipant(participant)}>
                                    Accept
                                </button>
                                <button className="bg-red-500 text-white px-4 py-2 rounded"
                                    onClick={() => handleDenyParticipant(participant)}>
                                    Deny
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AudioCallRoom;
