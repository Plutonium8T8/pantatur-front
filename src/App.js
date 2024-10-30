import React, {  useState } from 'react';
import './App.css';
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
// import TicketModal from './TicketModal';


function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // const [isCreating, setIsCreating] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
          <WorkflowDashboard />
      )}
    </div>
  );
}

export default App;
