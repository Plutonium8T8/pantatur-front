import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leads from './Components/LeadsComponent/LeadsComponent';
import LoginForm from './Components/LoginComponent/LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import Cookies from 'js-cookie';
import { AppProvider } from './AppContext'; // Импорт AppProvider
import { SnackbarProvider } from 'notistack';
import NotificationModal from './Components/SlideInComponent/NotificationModal'; // Модальное окно уведомлений
import TaskComponent from './Components/SlideInComponent/TaskComponent'; // Используем TaskModal вместо TaskComponent
import AdminPanel from './Components/AdminPanelComponent/AdminPanel';
import Dashboard from './Components/DashboardComponent/Dashboard';
import UserPage from './Components/UserPage/UserPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false); // Состояние модального окна уведомлений
  const [isTaskComponentOpen, setIsTaskComponentOpen] = useState(false); // Состояние модального окна задач
  const [isAccountComponentOpen, setIsAccountComponentOpen] = useState(false); // Состояние модального окна задач

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
      autoHideDuration={5000}
      maxSnack={5}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <AppProvider isLoggedIn={isLoggedIn}>
        <UserProvider>
          <Router>
              {!isLoggedIn ? (
                <LoginForm onLoginSuccess={handleLogin} />
              ) : (
                <div className="app-container">
                  <CustomSidebar
                    onOpenNotifications={() => setIsNotificationModalOpen(true)}
                    onOpenTasks={() => setIsTaskComponentOpen(true)} // Передаем функцию для открытия задач
                    onOpenAccount={() => setIsAccountComponentOpen(true)}
                  />
                  <div className="page-content">
                    <Routes>
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
                  <UserPage
                    isOpen={isAccountComponentOpen}
                    onClose={() => setIsAccountComponentOpen(false)}
                  />
                  <NotificationModal
                    isOpen={isNotificationModalOpen}
                    onClose={() => setIsNotificationModalOpen(false)}
                  />
                  <TaskComponent
                    isOpen={isTaskComponentOpen}
                    onClose={() => setIsTaskComponentOpen(false)}
                  />
                </div>
              )}
          </Router>
        </UserProvider>
      </AppProvider>
    </SnackbarProvider>
  );
}

export default App;