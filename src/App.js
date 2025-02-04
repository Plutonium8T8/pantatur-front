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
  const { userId, setUserId } = useUser(); // Теперь используем setUserId
  const { enqueueSnackbar } = useSnackbar();
  const [userRoles, setUserRoles] = useState(null);

  // Функция для получения сессии и user_id
  const fetchSession = async () => {
    const token = Cookies.get('jwt');
    if (!token) {
      console.log("❌ Нет токена, выход...");
      setIsLoggedIn(false);
      setUserRoles(null);
      setUserId(null);
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
        setUserId(data.user_id); // Обновляем userId в UserContext
      } else {
        console.log("❌ Нет user_id в ответе, выход...");
        setIsLoggedIn(false);
        setUserId(null);
      }
    } catch (error) {
      console.log("❌ Ошибка при запросе сессии:", error.message);
      Cookies.remove('jwt');
      setIsLoggedIn(false);
      setUserRoles(null);
      setUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для загрузки ролей
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
        setUserRoles(data.roles);
      } else {
        console.error(`❌ Ошибка загрузки ролей: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Ошибка при загрузке ролей:", error.message);
    }
  };

  // Загружаем сессию при загрузке страницы
  useEffect(() => {
    fetchSession();
  }, []);

  // Загружаем роли после обновления userId
  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchRoles();
    } else {
      setUserRoles(null);
    }
  }, [isLoggedIn, userId]);

  // 🔥 Функция логина: сначала обновляем сессию, затем роли
  const handleLogin = async () => {
    console.log("🔄 Логин: обновляем сессию...");
    await fetchSession();
    console.log("🔄 Логин: загружаем роли...");
    await fetchRoles();
  };

  // 🔥 Функция выхода: очищаем все данные
  const handleLogout = () => {
    console.log("❌ Выход: очищаем токен, роли и сессию...");
    Cookies.remove("jwt");
    setIsLoggedIn(false);
    setUserRoles(null);
    setUserId(null);
  };

  if (isLoading) {
    return <div className="spinner"></div>;
  }

  const NoAccess = () => (
    <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: 'red' }}>
      <h2>No acces page!</h2>
    </div>
  );

  return (
    <Router basename="/">
      <NavigationProvider> {/* Переместили выше AppProvider */}
        <AppProvider isLoggedIn={isLoggedIn}>
          <SnackbarProvider autoHideDuration={3000} maxSnack={5} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
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
                      <Route path="/admin-panel" element={userRoles && userRoles.includes("ROLE_ADMIN") ? <AdminPanel /> : <NoAccess />} />
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