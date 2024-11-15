import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import UserProfile from './Components/UserPage/UserPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <UserProvider>
      <Router>
        {!isLoggedIn ? (
          <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
        ) : (
          <div className="app-container">
            <CustomSidebar />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Navigate to="/workflowdashboard" />} />
                <Route path="/account" element={<UserProfile />} />
                <Route path="/workflowdashboard" element={<WorkflowDashboard />} />
                <Route path="/chat/:ticketId?" element={<ChatComponent />} />
                <Route path="*" element={<h1>Cooming soon</h1>} />
              </Routes>
            </div>
          </div>
        )}
      </Router>
    </UserProvider>
  );
}

export default App;