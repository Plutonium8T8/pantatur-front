import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import UserProfile from './Components/UserPage/UserPage';
import Cookies from 'js-cookie';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Для загрузки сессии

  useEffect(() => {
    const jwtToken = Cookies.get('jwt');
    if (jwtToken) {
      // Проверка валидности сессии
      fetch('https://pandaturapi.com/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        credentials: 'include',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Сессия истекла');
          }
          return response.json();
        })
        .then(data => {
          if (data.user_id) {
            setIsLoggedIn(true); // Сессия активна
          } else {
            setIsLoggedIn(false); // Сессия истекла
          }
        })
        .catch(() => {
          Cookies.remove('jwt'); // Удаляем токен при ошибке
          setIsLoggedIn(false);
        })
        .finally(() => setIsLoading(false)); // Убираем индикатор загрузки
    } else {
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>; // Индикатор загрузки
  }

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