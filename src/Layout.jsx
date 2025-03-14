import { useState } from "react"
import CustomSidebar from "./Components/SideBar/SideBar"
import UserPage from "./Components/UserPage/UserPage"
import NotificationModal from "./Components/SlideInComponent/NotificationModal"
import TaskComponent from "./Components/TaskComponent/TaskPage"
import { useUser } from "./UserContext"
import Cookies from "js-cookie"

export const Layout = ({ children }) => {
  const [isTaskComponentOpen, setIsTaskComponentOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isAccountComponentOpen, setIsAccountComponentOpen] = useState(false)

  const { userRoles, setUserId, setName, setSurname } = useUser()

  const handleLogout = () => {
    Cookies.remove("jwt")
    setUserId(null)
    setName(null)
    setSurname(null)
  }

  return (
    <div className="app-container">
      <CustomSidebar
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenTasks={() => setIsTaskComponentOpen(true)}
        onOpenAccount={() => setIsAccountComponentOpen(true)}
        onLogout={handleLogout}
        userRoles={userRoles}
      />
      <div className="page-content">{children}</div>
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
  )
}
