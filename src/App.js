import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leads from './Components/LeadsComponent/LeadsComponent';
import LoginForm from './Components/LoginComponent/LoginForm';
import { UserProvider, useUser } from './UserContext';
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
  const { userId } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [userRoles, setUserRoles] = useState(null);

  const fetchRoles = async () => {
    if (!userId) return;

    try {
      const token = Cookies.get("jwt");
      const response = await fetch(`https://pandatur-api.com/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Origin: 'https://plutonium8t8.github.io',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Роли пользователя:", data.roles);
        setUserRoles(data.roles);
      } else {
        console.error(`Ошибка: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error("Ошибка загрузки ролей:", error.message);
    }
  };

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
          if (data.user_id) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchRoles();
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    if (userRoles !== null) {
      console.log("user roles din app", userRoles);
    }
  }, [userRoles]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsLoading(false);
    fetchRoles();
  };

  if (isLoading) {
    return <div className="spinner"></div>;
  }

  const NoAccess = () => (
    <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: 'red' }}>
      <h2>No acces roles</h2>
    </div>
  );

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
                    <Route path="/chat/:ticketId?" element={<ChatComponent />} />

                    {/* Проверяем наличие роли ADMIN */}
                    <Route
                      path="/admin-panel"
                      element={
                        userRoles && userRoles.includes("ROLE_ADMIN") ? <AdminPanel /> : <NoAccess />
                      }
                    />

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