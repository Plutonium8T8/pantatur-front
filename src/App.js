import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leads from './Components/LeadsComponent/LeadsComponent';
import LoginForm from './Components/LoginComponent/LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import Cookies from 'js-cookie';
import { AppProvider } from './AppContext';
import { SnackbarProvider } from 'notistack';
import NotificationModal from './Components/SlideInComponent/NotificationModal';
import TaskComponent from './Components/SlideInComponent/TaskComponent';
import AdminPanel from './Components/AdminPanelComponent/AdminPanel';
import Dashboard from './Components/DashboardComponent/Dashboard';
import UserPage from './Components/UserPage/UserPage';
import { useSnackbar } from 'notistack';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isTaskComponentOpen, setIsTaskComponentOpen] = useState(false);
  const [isAccountComponentOpen, setIsAccountComponentOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const token = Cookies.get('jwt');
    if (token) {
      fetch('https://pandatur-api.com/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Origin: 'https://plutonium8t8.github.io',
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

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsLoading(false);
  };

  const NotFound = () => (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>404</h1>
      <p>Страница не найдена</p>
    </div>
  );

  if (isLoading) {
    return <div className="spinner"></div>;
  }

  return (
    <Router basename="/">
    <AppProvider isLoggedIn={isLoggedIn}>
      <SnackbarProvider
        autoHideDuration={3000}
        maxSnack={5}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <UserProvider>
            {!isLoggedIn ? (
              <LoginForm onLoginSuccess={handleLogin} />
            ) : (
              <div className="app-container">
                <CustomSidebar
                  onOpenNotifications={() => setIsNotificationModalOpen(true)}
                  onOpenTasks={() => setIsTaskComponentOpen(true)}
                  onOpenAccount={() => setIsAccountComponentOpen(true)}
                />
                <div className="page-content">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/" element={<Navigate to="/leads" />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route
                      path="/chat/:ticketId?"
                      element={<ChatComponent />}
                    />
                    <Route path="/admin-panel" element={<AdminPanel />} />
                    <Route path="*" element={<Navigate to="/index.html" />} />;
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
        </UserProvider>
      </SnackbarProvider>
    </AppProvider>
    </Router>
  );
}

export default App;