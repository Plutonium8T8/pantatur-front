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

  const { userId, setUserId, name, setName, surname, setSurname, userRoles, hasRole, isLoadingRoles } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const fetchSession = async () => {
    const token = Cookies.get('jwt');

    if (!token) {
      console.log("❌ JWT отсутствует, пропускаем загрузку сессии.");
      setIsLoggedIn(false);
      setUserId(null);
      setName(null);
      setSurname(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://pandatur-api.com/session', {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Origin": 'https://pandaturcrm.com',
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
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

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLogin = async () => {
    console.log("🔄 Логин: обновляем сессию...");
    await fetchSession();
  };

  const handleLogout = () => {
    console.log("❌ Выход: очищаем токен, роли и сессию...");
    Cookies.remove("jwt");
    setIsLoggedIn(false);
    setUserId(null);
    setName(null);
    setSurname(null);
  };

  if (isLoading || isLoadingRoles) {
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