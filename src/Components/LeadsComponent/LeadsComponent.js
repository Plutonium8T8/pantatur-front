import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../../AppContext'; // Подключение AppContext
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import SpinnerOverlay from './SpinnerOverlayComponent';
import WorkflowColumn from './WorkflowColumnComponent';
import ContextMenu from './ContextMenuComponent';
import TicketModal from './TicketModal/TicketModalComponent';
import Cookies from 'js-cookie';
import '../../App.css';
import '../SnackBarComponent/SnackBarComponent.css';

const Leads = () => {
  const { tickets, isLoading, setTickets } = useAppContext(); // Данные из AppContext
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  // Фильтрация тикетов по поисковому запросу
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const search = (searchTerm || "").toLowerCase();
      return (
        (ticket.contact?.toLowerCase() || "").includes(search) ||  // 🔍 Фильтр по contact
        String(ticket.id).includes(search)  // 🔍 Фильтр по ticket_id
      );
    });
  }, [tickets, searchTerm]);

  const updateWorkflow = async (ticketId, newWorkflow) => {
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`https://pandatur-api.com/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://plutonium8t8.github.io',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ workflow: newWorkflow }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update workflow: ${response.status}. ${error.message}`);
      }

      const updatedTicket = await response.json();

      // Локально обновляем тикеты
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === updatedTicket.ticket_id ? updatedTicket : ticket
        )
      );

      console.log('Workflow updated locally for ticketId:', ticketId);
    } catch (error) {
      console.error('Error updating workflow:', error);
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
            onEditTicket={(ticket) => {
              setCurrentTicket(ticket);
              setIsModalOpen(true);
            }}
            onContextMenu={handleContextMenu}
            onUpdateWorkflow={updateWorkflow}
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
          onSave={(updatedTicket) => {
            // Локальное обновление тикетов через setTickets
            setTickets((prevTickets) => {
              const isEditing = Boolean(updatedTicket.ticket_id);
              return isEditing
                ? prevTickets.map((ticket) =>
                  ticket.id === updatedTicket.ticket_id ? updatedTicket : ticket
                )
                : [...prevTickets, updatedTicket]; // Добавляем новый тикет
            });
          }}
        />
      )}
    </div>
  );
};

export default Leads;