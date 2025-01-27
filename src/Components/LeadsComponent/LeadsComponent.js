import React, { useState, useRef, useMemo } from 'react';
import { useAppContext } from '../../AppContext'; // Подключение AppContext
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import SpinnerOverlay from './SpinnerOverlayComponent';
import WorkflowColumn from './WorkflowColumnComponent';
import ContextMenu from './ContextMenuComponent';
import TicketModal from './TicketModal/TicketModalComponent';
import '../../App.css';
import '../SnackBarComponent/SnackBarComponent.css';

const Leads = () => {
  const { tickets, isLoading, setTickets, updateTicket, fetchSingleTicket } = useAppContext(); // Данные из AppContext
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  // Фильтрация тикетов по поисковому запросу
  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) =>
        ticket.contact.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [tickets, searchTerm]
  );

  // Обновление workflow тикета
  const updateTicketWorkflow = async (clientId, newWorkflow) => {
    try {
      // Обновление на сервере
      const updatedTicket = await updateTicket({ id: clientId, workflow: newWorkflow });

      // Локальное обновление состояния с использованием ответа сервера
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.client_id === clientId ? updatedTicket : ticket
        )
      );
    } catch (error) {
      console.error('Ошибка при обновлении тикета:', error);
    }
  };

  const openCreateTicketModal = () => {
    setCurrentTicket({
      contact: '',
      transport: '',
      country: '',
      priority: priorityOptions[0],
      workflow: workflowOptions[0],
      service_reference: '',
      technician_id: 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentTicket(null);
    setIsModalOpen(false);
  };

  const handleContextMenu = (event, ticket) => {
    if (!ticket) return; // Игнорируем пустую область
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      ticket,
    });
  };

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleSaveTicket = async (updatedTicket) => {
    try {
      // Сохраняем тикет через API
      const savedTicket = await fetchSingleTicket(updatedTicket.client_id);

      // Обновляем тикет в состоянии
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.client_id === savedTicket.client_id ? savedTicket : ticket
        )
      );

      closeModal();
    } catch (error) {
      console.error('Ошибка при сохранении тикета:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header">
          <button onClick={openCreateTicketModal} className="button-add-ticket">
            Add Ticket
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets..."
            className="search-input"
          />
        </div>
      </div>
      <div className="container-tickets">
        {workflowOptions.map((workflow) => (
          <WorkflowColumn
            key={workflow}
            workflow={workflow}
            tickets={filteredTickets}
            searchTerm={searchTerm}
            onUpdateWorkflow={updateTicketWorkflow}
            onEditTicket={(ticket) => {
              setCurrentTicket(ticket);
              setIsModalOpen(true);
            }}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>
      {isLoading && <SpinnerOverlay />}
      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          onClose={handleCloseContextMenu}
          onEditTicket={(ticket) => {
            setCurrentTicket(ticket);
            setIsModalOpen(true);
          }}
          ref={contextMenuRef}
        />
      )}
      {isModalOpen && currentTicket && (
        <TicketModal
          ticket={currentTicket}
          onClose={closeModal}
          onSave={handleSaveTicket}
        />
      )}
    </div>
  );
};

export default Leads;