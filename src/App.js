import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat'; // Импортируем компонент чата
import UserProfile from './Components/UserPage/UserPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <UserProvider>
      <Router>
        {!isLoggedIn ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="app-container">
            <CustomSidebar />
            <div className="page-content">
              <Routes>
                <Route path="/account" element={<UserProfile />} />
                <Route path="/workflowdashboard" element={<WorkflowDashboard />} />
                <Route path="/chat" element={<ChatComponent />} />
                <Route path="/chat/:ticketId" element={<ChatComponent />} /> {/* Роут для страницы чата */}
                <Route path="/" element={""} /> {/* Страница по умолчанию */}
              </Routes>
            </div>
          </div>
        )}
      </Router>
    </UserProvider>
  );
}

export default App;