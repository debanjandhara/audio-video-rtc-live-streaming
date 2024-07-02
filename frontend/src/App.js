import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
// import VideoCallPage from './pages/VideoCallPage';
import AudioCallPage from './pages/AudioCallPage';
// import StreamingPage from './pages/StreamingPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                {/* <Route path="/video-call" element={<VideoCallPage />} /> */}
                <Route path="/audio-call" element={<AudioCallPage />} />
                {/* <Route path="/streaming" element={<StreamingPage />} /> */}
            </Routes>
        </Router>
    );
};

export default App;
