import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import Cookies from 'js-cookie';
import { SocketProvider, useSocket } from './SocketContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const socket = useSocket();
  // Проверка сессии
  useEffect(() => {
    const token = Cookies.get('jwt');
    if (token) {
      fetch('https://pandaturapi.com/session', {
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

  // Загрузка начальных непрочитанных сообщений
  useEffect(() => {
    if (isLoggedIn) {
      fetch('https://pandaturapi.com/messages')
        .then((res) => res.json())
        .then((data) => {
          const unreadCount = data.filter((msg) => !msg.seen_at).length;
          setUnreadMessagesCount(unreadCount);
        })
        .catch(console.error);
    }
  }, [isLoggedIn]);

  // Подключение к WebSocket и обновление состояния
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'message' && !message.data.seen_at) {
            setUnreadMessagesCount((prev) => prev + 1);
          }
        } catch (error) {
          console.error('Ошибка WebSocket:', error);
        }
      };
    }
    return () => {
      if (socket) socket.onmessage = null;
    };
  }, [socket]);

  // Установка индикатора через ChatComponent
  const handleUpdateUnreadMessages = (newCount) => {
    setUnreadMessagesCount(newCount);
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <SocketProvider>
      <UserProvider>
        <Router>
          {!isLoggedIn ? (
            <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
          ) : (
            <div className="app-container">
              <CustomSidebar unreadMessagesCount={unreadMessagesCount} />
              <div className="page-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/workflowdashboard" />} />
                  <Route path="/workflowdashboard" element={<WorkflowDashboard />} />
                  <Route
                    path="/chat/:ticketId?"
                    element={
                      <ChatComponent
                        onUpdateUnreadMessages={setUnreadMessagesCount}
                      />
                    }
                  />
                </Routes>
              </div>
            </div>
          )}
        </Router>
      </UserProvider>
    </SocketProvider>
  );
}

export default App;