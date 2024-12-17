import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leads from './Leads';
import LoginForm from './LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import Cookies from 'js-cookie';
import { SocketProvider } from './SocketContext';
import UserProfile from './Components/UserPage/UserPage';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import Notification from './Notification';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Проверка сессии
  useEffect(() => {
    const token = Cookies.get('jwt');
    if (token) {
      fetch('https://pandatur-api.com/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })
        .then((response) => {
          if (!response.ok) throw new Error('Сессия истекла');
          return response.json();
        })
        .then((data) => {
          setIsLoggedIn(!!data.user_id);
        })
        .catch(() => {
          Cookies.remove('jwt');
          setIsLoggedIn(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  }, []);

  // Загрузка начальных данных для сообщений и уведомлений
  useEffect(() => {
    if (isLoggedIn) {
      fetch('https://pandatur-api.com/messages')
        .then((res) => res.json())
        .then((data) => {
          const unreadCount = data.filter((msg) => !msg.seen_at).length;
          setUnreadMessagesCount(unreadCount);
        })
        .catch(console.error);
    }
  }, [isLoggedIn]);


  if (isLoading) {
    return <div className="spinner"></div>;
  }

  const handleUpdateUnreadMessages = (newCount) => {
    setUnreadMessagesCount(newCount);
  };

  return (
      <SnackbarProvider
        iconVariant={{
          success: '✅ ',
          error: '✖️ ',
          warning: '⚠️ ',
          info: 'ℹ️ ',
        }}
        autoHideDuration={5000}
        maxSnack={10}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <SocketProvider isLoggedIn={isLoggedIn}>
          <UserProvider>
            <Notification onUpdateUnreadMessages={handleUpdateUnreadMessages} />
            <Router>
              {!isLoggedIn ? (
                <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
              ) : (
                <div className="app-container">
                  <CustomSidebar />
                  <div className="page-content">
                    <Routes>
                      <Route path="/account" element={<UserProfile />} />
                      <Route path="/" element={<Navigate to="/leads" />} />
                      <Route path="/leads" element={<Leads />} />
                      <Route
                        path="/chat/:ticketId?"
                        element={<ChatComponent />}
                      />
                      <Route path="*" element={<div>Страница в разработке</div>} />
                    </Routes>
                  </div>
                </div>
              )}
            </Router>
          </UserProvider>
        </SocketProvider>
      </SnackbarProvider>
  );
}

export default App;