import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import SpinnerOverlay from './SpinnerOverlayComponent';
import WorkflowColumn from './WorkflowColumnComponent';
import TicketModal from './TicketModal/TicketModalComponent';
import TicketFilterModal from './TicketFilterModal';
import TicketRow from './TicketRowComponent';
import Cookies from 'js-cookie';
import '../../App.css';
import '../SnackBarComponent/SnackBarComponent.css';
import { FaFilter, FaTable, FaColumns, FaTrash, FaEdit } from 'react-icons/fa';
import { translations } from '../utils/translations';

const Leads = () => {
  const { tickets, isLoading, setTickets } = useAppContext();
  const [isTableView, setIsTableView] = useState(false);
  const [filteredTicketIds, setFilteredTicketIds] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(
    workflowOptions.filter(wf => wf !== "Realizat cu succes" && wf !== "Închis și nerealizat")
  );
  const language = localStorage.getItem('language') || 'RO';

  const [filters, setFilters] = useState({
    creation_date: '',
    last_interaction_date: '',
    technician_id: [],
    sender_id: '',
    workflow: selectedWorkflow,
    priority: [],
    tags: '',
    platform: [],
  });

  // **Фильтрация тикетов**
  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (filteredTicketIds === null) return result;
    if (filteredTicketIds.length === 0) return [];
    result = result.filter(ticket => filteredTicketIds.includes(ticket.id));
    if (selectedWorkflow.length > 0) {
      result = result.filter(ticket => selectedWorkflow.includes(ticket.workflow));
    }
    return result;
  }, [tickets, filteredTicketIds, selectedWorkflow]);

  // Выбор тикетов
  const toggleSelectTicket = (ticketId) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]
    );
  };

  // Выбор всех тикетов
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTickets(filteredTickets.map(ticket => ticket.id));
    } else {
      setSelectedTickets([]);
    }
  };

  // Массовое удаление тикетов
  const deleteSelectedTickets = () => {
    if (selectedTickets.length === 0) return;
    const newTickets = tickets.filter(ticket => !selectedTickets.includes(ticket.id));
    setTickets(newTickets);
    setSelectedTickets([]);
  };

  const editSelectedTickets = () => {
    if (selectedTickets.length === 0) return;

    // Открываем модалку редактирования с первым выделенным тикетом
    const ticketToEdit = tickets.find(ticket => ticket.id === selectedTickets[0]);
    if (ticketToEdit) {
      setCurrentTicket(ticketToEdit);
      setIsModalOpen(true);
    }
  };

  const updateWorkflow = async (ticketId, newWorkflow) => {
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`https://pandatur-api.com/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Origin": 'https://pandaturcrm.com',
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
        credentials: 'include',
        body: JSON.stringify({ workflow: newWorkflow }),
      });

      if (response.status === 401) {
        alert(translations["Sesia a expirat"][language] || "Sesia a expirat, te rog sa accesezi din nou pagina!");
        window.location.reload();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update workflow: ${response.status}. ${errorData.message}`, window.location.reload());
      }

      const updatedTicket = await response.json();

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === updatedTicket.ticket_id ? updatedTicket : ticket
        )
      );

      console.log('✅ Workflow updated locally for ticketId:', ticketId);
    } catch (error) {
      console.error('❌ Error updating workflow:', error);
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

  useEffect(() => {
    console.log("🎯 Текущий список тикетов:", tickets);
    console.log("🎯 Отфильтрованные ID тикетов:", filteredTicketIds);
  }, [tickets, filteredTicketIds]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header">
          <button onClick={openCreateTicketModal} className="button-add-ticket">
            {translations["Adaugă lead"][language]}
          </button>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={translations["Cauta dupa Lead, Client sau Tag"][language]}
            className="search-input"
          />
          <button onClick={() => setIsTableView(prev => !prev)} className="button-toggle-view">
            {isTableView ? <FaColumns /> : <FaTable />}
            {isTableView ? 'Colon' : 'List'}
          </button>

          <div className="ticket-counter-row">
            All tickets: {tickets.length} | Filtered: {filteredTickets.length}
          </div>

          {selectedTickets.length > 0 && (
            <button onClick={deleteSelectedTickets} className="button-delete-row">
              <FaTrash /> Удалить ({selectedTickets.length})
            </button>
          )}

          {selectedTickets.length > 0 && (
            <button onClick={() => editSelectedTickets()} className="button-edit-row">
              <FaEdit /> Редактировать ({selectedTickets.length})
            </button>
          )}

          <button onClick={() => setIsFilterOpen(true)} className="button-filter">
            <FaFilter />
            {Object.values(filters).some(value => Array.isArray(value) ? value.length > 0 : value) && <span className="filter-indicator"></span>}
          </button>

        </div>
      </div>

      <div className="container-tickets">
        {isTableView ? (
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Check</th>
                <th>ID</th>
                <th>Contact</th>
                <th>Nume</th>
                <th>Prenume</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Descriere</th>
                <th>Tags</th>
                <th>Priority</th>
                <th>Workflow</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTickets.includes(ticket.id)}
                  onSelect={isTableView ? toggleSelectTicket : undefined} // Только в таблице
                  onEditTicket={setCurrentTicket}
                />
              ))}
            </tbody>
          </table>
        ) : (
          workflowOptions
            .filter(workflow => selectedWorkflow.includes(workflow))
            .map((workflow) => (
              <WorkflowColumn
                key={workflow}
                workflow={workflow}
                tickets={filteredTickets}
                searchTerm={searchTerm}
                onEditTicket={(ticket) => {
                  setCurrentTicket(ticket);
                  setIsModalOpen(true);
                }}
                onUpdateWorkflow={updateWorkflow}
              />
            ))
        )}
      </div>
      {isLoading && <SpinnerOverlay />}
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
        filteredTicketIds={filteredTicketIds} // 🔥 Передаем текущие `filteredTicketIds`
        onApplyFilter={(updatedFilters, ticketIds) => {
          console.log("🚀 Применяем фильтр с параметрами:", updatedFilters);

          setFilters({
            ...updatedFilters,
            technician_id: updatedFilters.technician_id
              ? updatedFilters.technician_id.map(t => parseInt(t.split(":")[0]))
              : [],
            priority: updatedFilters.priority || [],
            platform: updatedFilters.platform || [],
          });

          setSelectedWorkflow(Array.isArray(updatedFilters.workflow) ? updatedFilters.workflow : []);

          setFilteredTicketIds(ticketIds !== null ? ticketIds : null);
        }}
      />
    </div>
  );
};

export default Leads;