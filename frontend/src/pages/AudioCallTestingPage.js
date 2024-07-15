import '../styles/tailwind.css';
import React from 'react';
import { useParams } from 'react-router-dom';
import AudioCallTesting from '../components/AudioCallTesting';

const AudioCallTestingPage = () => {
    const { meetingLink } = useParams();
    const userId = localStorage.getItem('userId');  

    return (
        <div>
            <AudioCallTesting meetingLink={meetingLink} userId={userId} />
        </div>
    );
};

export default AudioCallTestingPage;
