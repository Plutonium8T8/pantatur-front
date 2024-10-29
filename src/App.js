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

  // Вариант 1: console.log внутри fetchTickets после установки тикетов
  const fetchTickets = async () => {
    try {
      const token = Cookies.get('jwt');
      const response = await fetch('https://pandaturapi-293102893820.europe-central2.run.app/api/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }

      const data = await response.json();
      setTickets(data);
      console.log("+++ Загруженные тикеты:", data); // Здесь данные уже загружены
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  // Вариант 2: useEffect, отслеживающий изменения в tickets
  useEffect(() => {
    console.log("+++ Обновленные тикеты:", tickets);
  }, [tickets]);


  useEffect(() => {
    // Получаем тикеты, только если пользователь залогинен
    if (isLoggedIn) {
      fetchTickets();
      console.log("+++" + tickets)
    }
  }, [isLoggedIn]);

  const updateTicketWorkflow = (ticketId, newWorkflow) => {
    console.log("Старые тикеты:", tickets);
    setTickets((prevTickets) => {
      const updatedTickets = prevTickets.map((ticket) =>
        ticket.id == ticketId ? { ...ticket, workflow: newWorkflow } : ticket
      );
      return updatedTickets; // Возврат обновленного состояния тикетов
    });
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
          <WorkflowDashboard
            tickets={tickets}
            updateTicket={updateTicketWorkflow}
            editTicket={editTicket}
            deleteTicket={deleteTicket}
            addTicket={addTicket}
            onEditTicket={openEditTicketModal}
            openCreateTicketModal={openCreateTicketModal}
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
