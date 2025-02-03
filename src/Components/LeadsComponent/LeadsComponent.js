import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import SpinnerOverlay from './SpinnerOverlayComponent';
import WorkflowColumn from './WorkflowColumnComponent';
import ContextMenu from './ContextMenuComponent';
import TicketModal from './TicketModal/TicketModalComponent';
import TicketFilterModal from './TicketFilterModal'; // Добавляем фильтр
import Cookies from 'js-cookie';
import '../../App.css';
import '../SnackBarComponent/SnackBarComponent.css';

const Leads = () => {
  const { tickets, isLoading, setTickets } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Состояние для фильтра

  const [filters, setFilters] = useState({
    creation_date: '',
    last_interaction_date: '',
    technician_id: '',
    workflow: '',
    priority: '',
    tags: '',
  });

  const contextMenuRef = useRef(null);

  // Фильтрация тикетов по параметрам
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const creationDate = ticket.creation_date ? ticket.creation_date.split(" ")[0] : "";
      const lastInteractionDate = ticket.last_interaction_date ? ticket.last_interaction_date.split(" ")[0] : "";

      // Разбиваем теги из строки в массив
      const ticketTags = ticket.tags
        ? ticket.tags.replace(/[{}]/g, "").split(",").map(tag => tag.trim().toLowerCase())
        : [];

      return (
        (!filters.creation_date || creationDate === filters.creation_date) &&
        (!filters.last_interaction_date || lastInteractionDate === filters.last_interaction_date) &&
        (!filters.technician_id || String(ticket.technician_id) === filters.technician_id) &&
        (!filters.workflow || ticket.workflow.toLowerCase() === filters.workflow.toLowerCase()) &&
        (!filters.priority || ticket.priority.toLowerCase() === filters.priority.toLowerCase()) &&
        (!filters.tags || ticketTags.includes(filters.tags.toLowerCase())) // ✅ Фильтр по тегам
      );
    });
  }, [tickets, filters]);

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
    if (!ticket) return;
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
          <button onClick={() => setIsFilterOpen(true)} className="button-filter">
            Filter
          </button>
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
            setTickets((prevTickets) => {
              const isEditing = Boolean(updatedTicket.ticket_id);
              return isEditing
                ? prevTickets.map((ticket) =>
                  ticket.id === updatedTicket.ticket_id ? updatedTicket : ticket
                )
                : [...prevTickets, updatedTicket];
            });
          }}
        />
      )}

      {/* Модальное окно фильтра */}
      <TicketFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilter={setFilters}
      />
    </div>
  );
};

export default Leads;