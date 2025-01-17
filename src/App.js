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
import { UnreadMessagesProvider } from './Unread';
import NotificationModal from './NotificationModal'; // Модальное окно уведомлений
import TaskComponent from './TaskComponent'; // Используем TaskModal вместо TaskComponent
import AdminPanel from './AdminPanel';
import Dashboard from './Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false); // Состояние модального окна уведомлений
  const [isTaskComponentOpen, setIsTaskComponentOpen] = useState(false); // Состояние модального окна задач

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

  // Обработка логина
  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="spinner"></div>;
  }

  return (
    <SnackbarProvider
      iconVariant={{
        success: '✅ ',
        error: '✖️ ',
        warning: '⚠️ ',
        info: '',
      }}
      autoHideDuration={null}
      maxSnack={5}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      action={(snackbarId) => (
        <>
          <button
            onClick={() => closeSnackbar(snackbarId)}
            style={{ background: 'none', color: 'blue', cursor: 'pointer', marginRight: '10px' }}
          >
            Закрыть ✖️
          </button>
        </>
      )}
    >
      <SocketProvider isLoggedIn={isLoggedIn}>
        <UserProvider>
          <Notification />
          <Router>
            <UnreadMessagesProvider isLoggedIn={isLoggedIn}>
              {!isLoggedIn ? (
                <LoginForm onLoginSuccess={handleLogin} />
              ) : (
                <div className="app-container">
                  <CustomSidebar
                    onOpenNotifications={() => setIsNotificationModalOpen(true)}
                    onOpenTasks={() => setIsTaskComponentOpen(true)} // Передаем функцию для открытия задач
                  />
                  <div className="page-content">
                    <Routes>
                      <Route path="/account" element={<UserProfile />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/" element={<Navigate to="/leads" />} />
                      <Route path="/leads" element={<Leads />} />
                      <Route
                        path="/chat/:clientId?"
                        element={<ChatComponent />}
                      />
                      <Route path="/admin-panel" element={<AdminPanel />} />
                      <Route path="*" element={<div>Страница в разработке</div>} />
                    </Routes>
                  </div>
                  {/* Модальное окно уведомлений */}
                  <NotificationModal
                    isOpen={isNotificationModalOpen}
                    onClose={() => setIsNotificationModalOpen(false)}
                  />
                  {/* Модальное окно задач */}
                  <TaskComponent
                    isOpen={isTaskComponentOpen}
                    onClose={() => setIsTaskComponentOpen(false)}
                  />
                </div>
              )}
            </UnreadMessagesProvider>
          </Router>
        </UserProvider>
      </SocketProvider>
    </SnackbarProvider>
  );
}

export default App;