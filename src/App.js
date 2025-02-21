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
import { NavigationProvider } from './NavigationContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isTaskComponentOpen, setIsTaskComponentOpen] = useState(false);
  const [isAccountComponentOpen, setIsAccountComponentOpen] = useState(false);

  const { userId, setUserId, name, setName, surname, setSurname, userRoles, setUserRoles, hasRole } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const fetchSession = async () => {
    const token = Cookies.get('jwt');

    if (!token) {
      console.log("❌ JWT отсутствует, пропускаем загрузку сессии.");
      setIsLoggedIn(false);
      setUserId(null);
      setName(null);
      setSurname(null);
      setUserRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://pandatur-api.com/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Origin: 'https://plutonium8t8.github.io',
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Сессия истекла');

      const data = await response.json();
      if (data.user_id) {
        console.log("✅ Сессия активна, user_id:", data.user_id);
        setIsLoggedIn(true);
        setUserId(data.user_id);
        setName(data.username || "");
        setSurname(data.surname || "");
      } else {
        console.log("❌ Нет user_id в ответе, выход...");
        handleLogout();
      }
    } catch (error) {
      console.log("❌ Ошибка при запросе сессии:", error.message);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    if (!userId) return;

    try {
      const token = Cookies.get("jwt");
      const response = await fetch(`https://pandatur-api.com/api/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Origin: 'https://plutonium8t8.github.io',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Роли пользователя загружены:", data.roles);

        // Распарсим строки JSON в массив
        const parsedRoles = JSON.parse(data.roles);
        setUserRoles(parsedRoles);
      } else {
        console.error(`❌ Ошибка загрузки ролей: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Ошибка при загрузке ролей:", error.message);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchRoles();
    } else {
      setUserRoles([]);
    }
  }, [isLoggedIn, userId]);

  const handleLogin = async () => {
    console.log("🔄 Логин: обновляем сессию...");
    await fetchSession();
    console.log("🔄 Логин: загружаем роли...");
    await fetchRoles();
  };

  const handleLogout = () => {
    console.log("❌ Выход: очищаем токен, роли и сессию...");
    Cookies.remove("jwt");
    setIsLoggedIn(false);
    setUserRoles([]);
    setUserId(null);
  };

  if (isLoading) {
    return <div className="spinner"></div>;
  }

  const NoAccess = () => (
    <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: 'red' }}>
      <h2>No access page!</h2>
    </div>
  );

  return (
    <Router basename="/">
      <NavigationProvider>
        <AppProvider isLoggedIn={isLoggedIn}>
          <SnackbarProvider autoHideDuration={5000} maxSnack={5} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
            <UserProvider>
              {!isLoggedIn ? (
                <LoginForm onLoginSuccess={handleLogin} />
              ) : (
                <div className="app-container">
                  <CustomSidebar
                    onOpenNotifications={() => setIsNotificationModalOpen(true)}
                    onOpenTasks={() => setIsTaskComponentOpen(true)}
                    onOpenAccount={() => setIsAccountComponentOpen(true)}
                    onLogout={handleLogout}
                    userRoles={userRoles}
                  />
                  <div className="page-content">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/" element={<Navigate to="/leads" />} />
                      <Route path="/leads" element={<Leads />} />
                      <Route path="/chat/:ticketId?" element={<ChatComponent />} />
                      <Route path="/admin-panel" element={hasRole("ROLE_ADMIN") ? <AdminPanel /> : <NoAccess />} />
                      <Route path="*" element={<Navigate to="/index.html" />} />
                    </Routes>
                  </div>
                  <UserPage isOpen={isAccountComponentOpen} onClose={() => setIsAccountComponentOpen(false)} />
                  <NotificationModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} />
                  <TaskComponent isOpen={isTaskComponentOpen} onClose={() => setIsTaskComponentOpen(false)} />
                </div>
              )}
            </UserProvider>
          </SnackbarProvider>
        </AppProvider>
      </NavigationProvider>
    </Router>
  );
}

export default App;