import React, { useState } from "react"
import "./App.css"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom"
import Leads from "./Components/LeadsComponent/LeadsComponent"
import LoginForm from "./Components/LoginComponent/LoginForm"
import { UserProvider, useUser } from "./UserContext"
import CustomSidebar from "./Components/SideBar/SideBar"
import ChatComponent from "./Components/ChatComponent/ChatComponent"
import Cookies from "js-cookie"
import { AppProvider } from "./AppContext"
import { SnackbarProvider } from "notistack"
import NotificationModal from "./Components/SlideInComponent/NotificationModal"
import TaskComponent from "./Components/TaskComponent/TaskComponent"
import AdminPanel from "./Components/AdminPanelComponent/AdminPanel"
import Dashboard from "./Components/DashboardComponent/Dashboard"
import UserPage from "./Components/UserPage/UserPage"
import { NavigationProvider } from "./NavigationContext"
import "./App.css"
import "./reset.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isTaskComponentOpen, setIsTaskComponentOpen] = useState(false)
  const [isAccountComponentOpen, setIsAccountComponentOpen] = useState(false)

  const { setUserId, setName, setSurname, userRoles, hasRole } = useUser()

  const handleLogin = () => {
    console.log("🔄 Логин: устанавливаем статус авторизации...")
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    console.log("❌ Выход: очищаем токен и сессию...")
    Cookies.remove("jwt")
    setIsLoggedIn(false)
    setUserId(null)
    setName(null)
    setSurname(null)
  }

  const NoAccess = () => (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        fontSize: "18px",
        color: "red"
      }}
    >
      <h2>No access page!</h2>
    </div>
  )

  return (
    <Router basename="/">
      <NavigationProvider>
        <AppProvider isLoggedIn={isLoggedIn}>
          <SnackbarProvider
            autoHideDuration={5000}
            maxSnack={5}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
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
                      <Route path="/leads/:ticketId?" element={<Leads />} />
                      <Route path="/chat/:ticketId?" element={<ChatComponent />} />
                      <Route
                        path="/admin-panel"
                        element={
                          hasRole("ROLE_ADMIN") ? <AdminPanel /> : <NoAccess />
                        }
                      />
                      <Route path="*" element={<Navigate to="/index.html" />} />
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
      </NavigationProvider>
    </Router>
  )
}

export default App
