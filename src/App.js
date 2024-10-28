import React, { useEffect, useState } from 'react';
import './App.css';
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
import TicketModal from './TicketModal';

function App() {
  const [tickets, setTickets] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    console.log(tickets);
  }, [tickets]);

  const updateTicketWorkflow = (ticketId, newWorkflow) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === parseInt(ticketId) ? { ...ticket, workflow: newWorkflow } : ticket
      )
    );
  };

  const editTicket = (updatedTicket) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === updatedTicket.id ? { ...ticket, ...updatedTicket } : ticket
      )
    );
  };

  const deleteTicket = (ticketId) => {
    setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== ticketId));
  };

  const addTicket = (newTicket) => {
    const id = tickets.length + 1;
    setTickets([...tickets, { ...newTicket, id }]);
    setIsModalOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const openCreateTicketModal = () => {
    setCurrentTicket(null);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const openEditTicketModal = (ticket) => {
    setCurrentTicket(ticket);
    setIsCreating(false);
    setIsModalOpen(true);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <button onClick={openCreateTicketModal} className="open-modal-button">
            Add ticket
          </button>
          <WorkflowDashboard
            tickets={tickets}
            updateTicket={updateTicketWorkflow}
            editTicket={editTicket}
            deleteTicket={deleteTicket}
            onEditTicket={openEditTicketModal}
          />

          {isModalOpen && (
            <TicketModal
              ticket={currentTicket}
              onClose={() => setIsModalOpen(false)}
              onEdit={isCreating ? addTicket : editTicket}
              onDelete={deleteTicket}
              isCreating={isCreating}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
