import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import SpinnerOverlay from './SpinnerOverlayComponent';
import WorkflowColumn from './WorkflowColumnComponent';
import TicketModal from './TicketModal/TicketModalComponent';
import TicketFilterModal from './TicketFilterModal';
import Cookies from 'js-cookie';
import '../../App.css';
import '../SnackBarComponent/SnackBarComponent.css';
import { FaFilter } from 'react-icons/fa';
import { translations } from '../utils/translations';

const Leads = () => {
  const { tickets, isLoading, setTickets, messages } = useAppContext();
  const [filteredTicketIds, setFilteredTicketIds] = useState(null); // 🚀 Новый стейт для ID отфильтрованных тикетов
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

    // ✅ Если `filteredTicketIds === null`, значит, фильтр не применён – показываем все тикеты
    if (filteredTicketIds === null) return result;

    // ✅ Если `filteredTicketIds` пуст (`[]`), ничего не показываем
    if (filteredTicketIds.length === 0) return [];

    // ✅ Фильтруем по ID
    result = result.filter(ticket => filteredTicketIds.includes(ticket.id));

    // ✅ Применяем фильтр по `workflow`
    if (selectedWorkflow.length > 0) {
      result = result.filter(ticket => selectedWorkflow.includes(ticket.workflow));
    }

    return result;
  }, [tickets, filteredTicketIds, selectedWorkflow]);

  const updateWorkflow = async (ticketId, newWorkflow) => {
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`https://pandatur-api.com/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://plutonium8t8.github.io',
          Authorization: `Bearer ${token}`,
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
          <button onClick={() => setIsFilterOpen(true)} className="button-filter">
            <FaFilter />
            {Object.values(filters).some(value => Array.isArray(value) ? value.length > 0 : value) && <span className="filter-indicator"></span>}
          </button>
        </div>
      </div>
      <div className="container-tickets">
        {workflowOptions
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
          ))}
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