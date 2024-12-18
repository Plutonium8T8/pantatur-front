import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leads from './Leads';
import LoginForm from './LoginForm';
import { UserProvider, useUser } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import Cookies from 'js-cookie';
import { SocketProvider } from './SocketContext';
import UserProfile from './Components/UserPage/UserPage';
import { SnackbarProvider } from 'notistack';
import Notification from './Notification';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0); // Для непрочитанных сообщений
  const [tickets, setTickets] = useState([]); // Массив тикетов
  const [messages, setMessages] = useState([]); // Массив сообщений
  const { userId } = useUser(); // Получаем userId после логина

  // Подсчёт непрочитанных сообщений
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const newTotalUnreadMessages = tickets.reduce((total, ticket) => {
      const chatMessages = messages.filter((msg) => msg.client_id === ticket.id);

      const unreadCounts = chatMessages.filter(
        (msg) =>
          (!msg.seen_by || !msg.seen_by.includes(String(userId))) &&
          msg.sender_id !== Number(userId)
      ).length;

      return total + unreadCounts;
    }, 0);

    setUnreadCount(newTotalUnreadMessages);
  }, [isLoggedIn, userId, messages, tickets]);

  // Обработка логина
  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsLoading(false);
  };

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

  // Загрузка начальных данных сообщений
  useEffect(() => {
    if (isLoggedIn) {
      fetch('https://pandatur-api.com/messages')
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
        })
        .catch(console.error);
    }
  }, [isLoggedIn]);

  // Обновление количества непрочитанных сообщений
  const handleUpdateUnreadMessages = (newCount) => {
    setUnreadMessagesCount(newCount);
  };

  if (isLoading) {
    return <div className="spinner"></div>;
  }

  return (
    <SnackbarProvider
      iconVariant={{
        success: '✅',
        error: '✖️',
        warning: '⚠️',
        info: 'ℹ️',
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
              <LoginForm onLoginSuccess={handleLogin} />
            ) : (
              <div className="app-container">
                <CustomSidebar unreadCount={unreadCount} />
                <div className="page-content">
                  <Routes>
                    <Route path="/account" element={<UserProfile />} />
                    <Route path="/" element={<Navigate to="/leads" />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route
                      path="/chat/:ticketId?"
                      element={
                        <ChatComponent
                          setMessagesProp={setMessages}
                          setTicketsProp={setTickets}
                        />
                      }
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