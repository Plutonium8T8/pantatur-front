import React, { useState } from 'react';
import './App.css';
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
import { UserProvider } from './UserContext';
import CustomSidebar from './Components/SideBar/SideBar';
import ChatComponent from './Components/ChatComponent/chat';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('workflowdashboard');

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  let pageContent;

  switch (activePage) {
    case 'workflowdashboard':
      pageContent = <WorkflowDashboard />;
      break;
    case 'chat':
      pageContent = <ChatComponent />;
      break;
    default:
      pageContent = <WorkflowDashboard />;
  }

  return (
    <UserProvider>
      <div className="App">
        {!isLoggedIn ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className='sidebar-page-content'>
            <CustomSidebar onNavigate={handleNavigate} />
            <div>
              {pageContent}
            </div>
          </div>
        )}
      </div>
    </UserProvider>
  );
}

export default App;
