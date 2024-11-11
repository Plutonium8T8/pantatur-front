import React, { useState } from 'react';
import './App.css';
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';
import UserProfile from './Components/UserPage/UserPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('account'); // Устанавливаем начальную страницу на 'account'
  const [isChatOpen, setIsChatOpen] = useState(false); // Состояние для модального чата

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActivePage('account'); // Переходим на страницу аккаунта после успешного входа
  };

  const handleNavigate = (page) => {
    if (page === 'chat') {
      setIsChatOpen(true); // Открываем чат в модальном окне
    } else {
      setActivePage(page);
    }
  };

  const closeChatModal = () => {
    setIsChatOpen(false); // Закрываем модальное окно чата
  };

  let pageContent;

  switch (activePage) {
    case 'account':
      pageContent = <UserProfile />;
      break;
    case 'workflowdashboard':
      pageContent = <WorkflowDashboard />;
      break;
    default:
      pageContent = "";
  }

  return (
    <UserProvider>
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="app-container">
          <CustomSidebar onNavigate={handleNavigate} />
          <div className="page-content">
            {pageContent}
          </div>

          {/* Модальное окно для чата */}
          {isChatOpen && (
            <div className="chat-modal">
              <div className="modal-overlay" onClick={closeChatModal}></div>
              <div className="chat-modal-content">
                <ChatComponent />
                <button className="close-modal-btn" onClick={closeChatModal}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </UserProvider>
  );
}

export default App;