import React, { useState, useMemo, useEffect, useRef } from "react";
import { SpinnerRightBottom } from "../SpinnerRightBottom";
import { useDOMElementHeight } from "../../hooks";
import { useAppContext } from "../../AppContext";
import { priorityOptions } from "../../FormOptions/PriorityOption";
import { workflowOptions } from "../../FormOptions/WorkFlowOption";
import WorkflowColumn from "./WorkflowColumnComponent";
import TicketModal from "./TicketModal/TicketModalComponent";
import TicketFilterModal from "./TicketFilterModal";
import "../../App.css";
import "../SnackBarComponent/SnackBarComponent.css";
import { FaFilter, FaTable, FaColumns, FaTrash, FaEdit } from "react-icons/fa";
import { getLanguageByKey } from "../../Components/utils/getLanguageByKey";
import { LeadTable } from "./LeadTable";

const Leads = () => {
  const refLeadsFilter = useRef();

  const { tickets, isLoading, setTickets } = useAppContext();
  const [isTableView, setIsTableView] = useState(false);
  const [filteredTicketIds, setFilteredTicketIds] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(
    workflowOptions.filter(
      (wf) => wf !== "Realizat cu succes" && wf !== "Închis și nerealizat",
    ),
  );
  const leadsFilterHeight = useDOMElementHeight(refLeadsFilter);

  const [filters, setFilters] = useState({
    creation_date: "",
    last_interaction_date: "",
    technician_id: [],
    sender_id: "",
    workflow: selectedWorkflow,
    priority: [],
    tags: "",
    platform: [],
  });

  // **Фильтрация тикетов**
  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (filteredTicketIds === null) return result;
    if (filteredTicketIds.length === 0) return [];
    result = result.filter((ticket) => filteredTicketIds.includes(ticket.id));
    if (selectedWorkflow.length > 0) {
      result = result.filter((ticket) =>
        selectedWorkflow.includes(ticket.workflow),
      );
    }
    return result;
  }, [tickets, filteredTicketIds, selectedWorkflow]);

  // Выбор тикетов
  const toggleSelectTicket = (ticketId) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId],
    );
  };

  // Выбор всех тикетов
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTickets(filteredTickets.map((ticket) => ticket.id));
    } else {
      setSelectedTickets([]);
    }
  };

  // Массовое удаление тикетов
  const deleteSelectedTickets = () => {
    if (selectedTickets.length === 0) return;
    const newTickets = tickets.filter(
      (ticket) => !selectedTickets.includes(ticket.id),
    );
    setTickets(newTickets);
    setSelectedTickets([]);
  };

  const editSelectedTickets = () => {
    if (selectedTickets.length === 0) return;

    // Открываем модалку редактирования с первым выделенным тикетом
    const ticketToEdit = tickets.find(
      (ticket) => ticket.id === selectedTickets[0],
    );
    if (ticketToEdit) {
      setCurrentTicket(ticketToEdit);
      setIsModalOpen(true);
    }
  };

  const openCreateTicketModal = () => {
    setCurrentTicket({
      contact: "",
      transport: "",
      country: "",
      priority: priorityOptions[0],
      workflow: workflowOptions[0],
      service_reference: "",
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
    <>
      <div ref={refLeadsFilter} className="dashboard-header">
        <div className="header">
          <button onClick={openCreateTicketModal} className="button-add-ticket">
            {getLanguageByKey("Adaugă lead")}
          </button>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={getLanguageByKey("Cauta dupa Lead, Client sau Tag")}
            className="search-input"
          />
          <button
            onClick={() => setIsTableView((prev) => !prev)}
            className="button-toggle-view"
          >
            {isTableView ? <FaColumns /> : <FaTable />}
            {getLanguageByKey(isTableView ? "Coloană" : "Listă")}
          </button>

          <div className="ticket-counter-row">
            {getLanguageByKey("Toate tichetele")}: {tickets.length} |{" "}
            {getLanguageByKey("Filtrate")}: {filteredTickets.length}
          </div>

          {selectedTickets.length > 0 && (
            <button
              onClick={deleteSelectedTickets}
              className="button-delete-row"
            >
              <FaTrash /> {getLanguageByKey("Ștergere")} (
              {selectedTickets.length})
            </button>
          )}

          {selectedTickets.length > 0 && (
            <button
              onClick={() => editSelectedTickets()}
              className="button-edit-row"
            >
              <FaEdit /> {getLanguageByKey("Editare")} ({selectedTickets.length}
              )
            </button>
          )}

          <button
            onClick={() => setIsFilterOpen(true)}
            className="button-filter"
          >
            <FaFilter />
            {Object.values(filters).some((value) =>
              Array.isArray(value) ? value.length > 0 : value,
            ) && <span className="filter-indicator"></span>}
          </button>
        </div>
      </div>

      <div
        style={{
          "--leads-filter-height": `${leadsFilterHeight}px`,
        }}
        className={`dashboard-container ${isTableView ? "leads-table" : ""}`}
      >
        
          {isTableView ? (
            <div className="leads-table">
              <LeadTable
                filteredTickets={filteredTickets}
                selectedTickets={selectedTickets}
                setCurrentTicket={setCurrentTicket}
                toggleSelectTicket={toggleSelectTicket}
              />
            </div>
          ) : (
            <div className="container-tickets">
              {workflowOptions
                .filter((workflow) => selectedWorkflow.includes(workflow))
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
                  />
                ))}
            </div>
          )}
        
        {isLoading && <SpinnerRightBottom />}
        {isModalOpen && currentTicket && (
          <TicketModal
            ticket={currentTicket}
            onClose={closeModal}
            onSave={(updatedTicket) => {
              setTickets((prevTickets) => {
                const isEditing = Boolean(updatedTicket.ticket_id);
                return isEditing
                  ? prevTickets.map((ticket) =>
                      ticket.id === updatedTicket.ticket_id
                        ? updatedTicket
                        : ticket,
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
                ? updatedFilters.technician_id.map((t) =>
                    parseInt(t.split(":")[0]),
                  )
                : [],
              priority: updatedFilters.priority || [],
              platform: updatedFilters.platform || [],
            });

            setSelectedWorkflow(
              Array.isArray(updatedFilters.workflow)
                ? updatedFilters.workflow
                : [],
            );

            setFilteredTicketIds(ticketIds !== null ? ticketIds : null);
          }}
        />
      </div>
    </>
  );
};

export default Leads;
