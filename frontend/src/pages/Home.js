import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h1>Welcome to Agora Video & Voice App</h1>
            <Link to="/video-call">Video Call</Link>
            <Link to="/audio-call">Audio Call</Link>
            <Link to="/streaming">Start Streaming</Link>
        </div>
    );
};

export default Home;
