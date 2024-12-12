import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leads from './Leads';
import LoginForm from './LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import Cookies from 'js-cookie';
import { SocketProvider, useSocket } from './SocketContext';
import UserProfile from './Components/UserPage/UserPage';
import { SnackbarProvider } from 'notistack';
import { closeSnackbar } from 'notistack'
import Notification from './Notification';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const socket = useSocket();

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

  // fetch('https://pandatur-api.com/notifications')
  //   .then((res) => res.json())
  //   .then((data) => {
  //     const unreadNotifications = data.filter((notif) => !notif.seen_at).length;
  //     setUnreadNotificationsCount(unreadNotifications);
  //   })
  //   .catch(console.error);
  // }, [isLoggedIn]);

  // Подключение к WebSocket для уведомлений
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'message' && !message.data.seen_at) {
            setUnreadMessagesCount((prev) => prev + 1);
          }
          if (message.type === 'notification' && !message.data.seen_at) {
            setUnreadNotificationsCount((prev) => prev + 1);
          }
        } catch (error) {
          console.error('Ошибка Socket:', error);
        }
      };
    }
    return () => {
      if (socket) socket.onmessage = null;
    };
  }, [socket]);

  if (isLoading) {
    return <div className="spinner"></div>;
  }

  return (
    <SnackbarProvider
      autoHideDuration={7000}
      maxSnack={10}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
      action={(snackbarId) =>
      (<button onClick={() => closeSnackbar(snackbarId)}
        style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }} > Закрыть </button>)}
    >
      <SocketProvider>
        <UserProvider>
        <Notification/>
          <Router>
            {!isLoggedIn ? (
              <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
            ) : (
              <div className="app-container">
                <CustomSidebar unreadMessagesCount={unreadMessagesCount} />
                <div className="page-content">
                  <Routes>
                    <Route path="/account" element={<UserProfile />} />
                    <Route path="/" element={<Navigate to="/leads" />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/chat/:ticketId?" element={<ChatComponent onUpdateUnreadMessages={setUnreadMessagesCount} />} />
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