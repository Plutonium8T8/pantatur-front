import React, { useState, useRef } from 'react';
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
  const { tickets, isLoading, setTickets, updateTicket } = useAppContext(); // Данные из AppContext
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  // Функция обновления тикета (с локальным обновлением и запросом к серверу)
  const updateTicketWorkflow = async (clientId, newWorkflow) => {
    try {
      // Локальное обновление состояния для мгновенной обратной связи
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.client_id === clientId ? { ...ticket, workflow: newWorkflow } : ticket
        )
      );

      // Отправка обновлений на сервер
      await updateTicket({ id: clientId, workflow: newWorkflow });
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
            tickets={tickets}
            searchTerm={searchTerm}
            onUpdateWorkflow={updateTicketWorkflow}
            onEditTicket={setCurrentTicket}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>
      {isLoading && <SpinnerOverlay />}
      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          onClose={handleCloseContextMenu}
          onEditTicket={setCurrentTicket}
          ref={contextMenuRef}
        />
      )}
      {currentTicket && (
        <TicketModal
          ticket={currentTicket}
          onClose={closeModal}
          onSave={() => { }} // Тикеты обновляются автоматически через контекст
        />
      )}
    </div>
  );
};

export default Leads;