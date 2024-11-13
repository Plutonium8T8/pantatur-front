import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Используем Routes
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import UserProfile from './Components/UserPage/UserPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Состояние для модального чата

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleNavigate = (page) => {
    if (page === 'chat') {
      setIsChatOpen(true); // Открываем чат в модальном окне
    }
  };

  const closeChatModal = () => {
    setIsChatOpen(false); // Закрываем модальное окно чата
  };

  return (
    <UserProvider>
      <Router>
        {!isLoggedIn ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="app-container">
            <CustomSidebar onNavigate={handleNavigate} />
            <div className="page-content">
              <Routes>
                <Route path="/account" element={<UserProfile />} />
                <Route path="/workflowdashboard" element={<WorkflowDashboard />} />
                <Route path="/" element={<WorkflowDashboard />} /> {/* Страница по умолчанию */}
              </Routes>
            </div>

            {/* Модальное окно для чата */}
            {isChatOpen && (
              <div className="chat-modal">
                <div className="modal-overlay" onClick={closeChatModal}></div>
                <div className="chat-modal-content">
                  <ChatComponent />
                  <button className="close-modal-btn" onClick={closeChatModal}>Close</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Router>
    </UserProvider>
  );
}

export default App;