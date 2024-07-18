import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AudioCallRoom from './components/AudioCallRoom';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/audio/:meetingLink" element={<AudioCallRoom />} />                
            </Routes>
        </Router>
    );
};

export default App;
