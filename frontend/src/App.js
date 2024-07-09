import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Settings from './components/ProfileSettings';
import ChatPage from './components/ChatPage';  // Import the new ChatPage component
import './App.css';

const App = () => {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/chat" element={<ChatPage />} />  {/* Add new route for ChatPage */}
                </Routes>
            </Router>
        </div>
    );
};

export default App;
