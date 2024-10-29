import React, { useEffect, useState } from 'react';
import './App.css';
import WorkflowDashboard from './WorkflowDashboard';
import LoginForm from './LoginForm';
import TicketModal from './TicketModal';
import Cookies from 'js-cookie';

function App() {
  const [tickets, setTickets] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    console.log(tickets);
  }, [tickets]);

  const fetchTickets = async () => {
    try {
      const token = Cookies.get('jwt'); // Получение токена из cookies
      const response = await fetch('https://pandaturapi-293102893820.europe-central2.run.app/api/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Используем токен
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }
  
      const data = await response.json();
      setTickets(data); // Убедитесь, что структура данных соответствует вашему состоянию
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };
  

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
    const id = tickets.length + 1; // Генерация ID для нового тикета
    setTickets([...tickets, { ...newTicket, id }]);
    setIsModalOpen(false); // Закрытие модального окна
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchTickets(); // Получение тикетов при успешном входе
    }
  }, [isLoggedIn]);

  return (
    <div className="App">
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <WorkflowDashboard
            tickets={tickets}
            updateTicket={updateTicketWorkflow}
            editTicket={editTicket}
            deleteTicket={deleteTicket}
            addTicket={addTicket} // Передаем функцию добавления тикетов
            onEditTicket={openEditTicketModal}
            openCreateTicketModal={openCreateTicketModal} // Передаем функцию для открытия модального окна
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
