import './Home.css';
import '../styles/tailwind.css'
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createMeeting } from '../utils/api';

const Home = () => {
    const [meetingId, setMeetingId] = useState('');
    const [userId, setUserId] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    const handleCreateMeeting = async () => {
        try {
            const response = await createMeeting(userId);

            // Extract the meeting_id safely
            if (response && response.meeting_id) {
                const meetingId = response.meeting_id;
                const meetingLink = `${window.location.origin}/audio/${meetingId}`;
                setResponseMessage(`Meeting created: <a href="${meetingLink}" target="_blank">${meetingLink}</a>`);
            } else {
                setResponseMessage('Unexpected response format.');
            }

        } catch (error) {
            console.error('Error creating meeting:', error);
            setResponseMessage('Error creating meeting. Please try again.');
        }
    };


    const handleJoinMeeting = () => {
        if (meetingId) {
            navigate(`/audio/${meetingId}`);
        }
    };

    const handleSetUserId = () => {
        if (userId) {
            localStorage.setItem('userId', userId);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Welcome to Agora Video & Voice App</h1>
            <div className="mb-4">
                <Link to="/video-call" className="text-blue-500 mr-4">Video Call</Link>
                <Link to="/audio-call" className="text-blue-500 mr-4">Audio Call</Link>
                <Link to="/streaming" className="text-blue-500">Start Streaming</Link>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="border p-2 mr-2"
                />
                <button onClick={handleSetUserId} className="bg-blue-500 text-white p-2 rounded">Set User ID</button>
                {localStorage.getItem('userId') && (
                    <p className="mt-2 text-gray-600">Current User ID: {localStorage.getItem('userId')}</p>
                )}
            </div>
            <div className="mb-4">
                <button onClick={handleCreateMeeting} className="bg-green-500 text-white p-2 rounded">Create Meeting ID</button>
                <div dangerouslySetInnerHTML={{ __html: responseMessage }} />
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter Meeting ID"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    className="border p-2 mr-2"
                />
                <button onClick={handleJoinMeeting} className="bg-blue-500 text-white p-2 rounded">Join Meeting</button>
            </div>
        </div>
    );
};

export default Home;
