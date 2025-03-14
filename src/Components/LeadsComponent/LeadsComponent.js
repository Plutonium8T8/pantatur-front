import React, { useState, useMemo, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { SpinnerRightBottom } from "../SpinnerRightBottom"
import { useDOMElementHeight, useApp } from "../../hooks"
import { priorityOptions } from "../../FormOptions/PriorityOption"
import { workflowOptions } from "../../FormOptions/WorkFlowOption"
import WorkflowColumn from "./WorkflowColumnComponent"
import TicketModal from "./TicketModal/TicketModalComponent"
import { TicketFilterModal } from "../TicketFilterModal"
import "../../App.css"
import "../SnackBarComponent/SnackBarComponent.css"
import { FaFilter, FaTable, FaColumns, FaTrash, FaEdit } from "react-icons/fa"
import { getLanguageByKey } from "../../Components/utils/getLanguageByKey"
import { LeadTable } from "./LeadTable"
import { Button } from "../Button"
import { useDebounce } from "../../hooks"
import { showServerError, getTotalPages } from "../utils"
import { api } from "../../api"
import { useSnackbar } from "notistack"
import { Input } from "../Input/Input"
import { Modal } from "../Modal"
import SingleChat from "../ChatComponent/SingleChat"

const SORT_BY = "creation_date"
const ORDER = "DESC"
const HARD_TICKET = "hard"
const LIGHT_TICKET = "light"
const NUMBER_PAGE = 1

const normalizeLadsFilters = (filters) => {
  return {
    ...filters,
    technician_id: filters.technician_id
      ? filters.technician_id.map((t) => parseInt(t.split(":")[0]))
      : []
  }
}

const Leads = () => {
  const refLeadsFilter = useRef()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const [hardTickets, setHardTickets] = useState([])
  const { tickets, isLoading, setTickets } = useApp()
  const [isTableView, setIsTableView] = useState(false)
  const [filteredTicketIds, setFilteredTicketIds] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTicket, setCurrentTicket] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedTickets, setSelectedTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalLeads, setTotalLeads] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [tableLeadsFilters, setTableLeadsFilters] = useState({})
  const [loadingFilters, setLoadingFilters] = useState(false)
  const { ticketId } = useParams() // Получаем ticketId из URL
  const [isChatOpen, setIsChatOpen] = useState(!!ticketId) // Если ticketId есть, сразу открываем модалку
  const [selectedWorkflow, setSelectedWorkflow] = useState(
    workflowOptions.filter(
      (wf) => wf !== "Realizat cu succes" && wf !== "Închis și nerealizat"
    )
  )
  const leadsFilterHeight = useDOMElementHeight(refLeadsFilter)
  const [filters, setFilters] = useState({
    creation_date: "",
    last_interaction_date: "",
    technician_id: [],
    sender_id: "",
    workflow: selectedWorkflow,
    priority: [],
    tags: "",
    platform: []
  })
  const debouncedSearch = useDebounce(searchTerm)

  const filteredTickets = useMemo(() => {
    let result = tickets
    if (filteredTicketIds === null) return result
    if (filteredTicketIds.length === 0) return []
    result = result.filter((ticket) => filteredTicketIds.includes(ticket.id))
    if (selectedWorkflow.length > 0) {
      result = result.filter((ticket) =>
        selectedWorkflow.includes(ticket.workflow)
      )
    }
    return result
  }, [tickets, filteredTicketIds, selectedWorkflow])

  useEffect(() => {
    if (ticketId) {
      setIsChatOpen(true)
    }
  }, [ticketId])

  const closeChatModal = () => {
    setIsChatOpen(false)
    navigate("/leads") // При закрытии убираем ticketId из URL
  }

  const toggleSelectTicket = (ticketId) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    )
  }

  const deleteTicket = async () => {
    if (selectedTickets.length === 0) return
    const findTicket = tickets.find((ticket) =>
      selectedTickets.includes(ticket.id)
    )
    const newTickets = tickets.filter((ticket) => ticket.id !== findTicket.id)

    try {
      setLoading(true)
      await api.tickets.deleteById(findTicket.id)
      await fetchTickets(
        {
          type: HARD_TICKET,
          page: currentPage,
          attributes: tableLeadsFilters
        },
        ({ data, pagination }) => {
          setHardTickets(data)
          setTotalLeads(pagination.total || 0)
        }
      )
      setTickets(newTickets)
      setSelectedTickets([])
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const editSelectedTickets = () => {
    if (selectedTickets.length === 0) return

    const ticketToEdit = tickets.find(
      (ticket) => ticket.id === selectedTickets[0]
    )
    if (ticketToEdit) {
      setCurrentTicket(ticketToEdit)
      setIsModalOpen(true)
    }
  }

  const openCreateTicketModal = () => {
    setCurrentTicket({
      contact: "",
      transport: "",
      country: "",
      priority: priorityOptions[0],
      workflow: workflowOptions[0],
      service_reference: "",
      technician_id: 0
    })
    setIsModalOpen(true)
  }

  const fetchTickets = async (
    { page, type, sortBy = SORT_BY, order = ORDER, attributes = {} },
    cb,
    showModalLoading
  ) => {
    try {
      if (showModalLoading) {
        setLoadingFilters(true)
      } else {
        setLoading(true)
      }
      const hardTicket = await api.tickets.filters({
        page,
        sort_by: sortBy,
        order: order,
        type,
        attributes
      })

      cb(hardTicket)
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    } finally {
      if (showModalLoading) {
        setLoadingFilters(false)
      } else {
        setLoading(false)
      }
    }
  }

  const closeModal = () => {
    setCurrentTicket(null)
    setIsModalOpen(false)
  }

  const closeTicketModal = () => setIsFilterOpen(false)

  const applyWorkflowFilters = (updatedFilters, ticketIds) => {
    setFilters(updatedFilters)

    setSelectedWorkflow(
      Array.isArray(updatedFilters.workflow) ? updatedFilters.workflow : []
    )

    setFilteredTicketIds(ticketIds !== null ? ticketIds : null)
    closeTicketModal()
  }

  const handleApplyFiltersHardTicket = (formattedFilters) => {
    fetchTickets(
      { attributes: formattedFilters, page: NUMBER_PAGE, type: HARD_TICKET },
      ({ data, pagination }) => {
        setHardTickets(data)
        setTotalLeads(pagination.total || 0)
        setCurrentPage(1)
        setTableLeadsFilters(formattedFilters)
        closeTicketModal()
      },
      true
    )
  }

  const handleApplyFilterLightTicket = (formattedFilters) => {
    fetchTickets(
      { page: NUMBER_PAGE, type: LIGHT_TICKET, attributes: formattedFilters },
      ({ data }) => {
        applyWorkflowFilters(filters, data)
      }
    )
  }

  const handlePaginationWorkflow = (page) => {
    fetchTickets(
      { page, type: HARD_TICKET, attributes: tableLeadsFilters },
      ({ data, pagination }) => {
        setHardTickets(data)
        setTotalLeads(pagination.total || 0)
        setCurrentPage(page)
      }
    )
  }

  useEffect(() => {
    if (isTableView) {
      fetchTickets(
        {
          type: HARD_TICKET,
          page: currentPage
        },
        ({ data, pagination }) => {
          setHardTickets(data)
          setTotalLeads(pagination.total || 0)
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTableView])

  useEffect(() => {
    fetchTickets(
      {
        type: isTableView ? HARD_TICKET : LIGHT_TICKET,
        page: currentPage,
        attributes: {
          search: debouncedSearch
        }
      },
      ({ data, pagination }) => {
        if (isTableView) {
          setHardTickets(data)
          setTotalLeads(pagination.total || 0)
          return
        }
        applyWorkflowFilters(filters, data)
        setTotalLeads(pagination || 0)
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  return (
    <>
      <div ref={refLeadsFilter} className="dashboard-header">
        <div className="header">
          <Button
            variant="primary"
            onClick={openCreateTicketModal}
            className="button-add-ticket"
          >
            {getLanguageByKey("Adaugă lead")}
          </Button>

          <Input
            value={searchTerm}
            onChange={(e) => {
              if (e) {
                setSearchTerm(e.target.value)
              } else {
                setSearchTerm("")
              }
            }}
            placeholder={getLanguageByKey("Cauta dupa Lead, Client sau Tag")}
            className="search-input"
            clear
          />
          <button
            onClick={() => setIsTableView((prev) => !prev)}
            className="d-flex align-items-center gap-4"
          >
            {isTableView ? <FaColumns /> : <FaTable />}
            {getLanguageByKey(isTableView ? "Coloană" : "Listă")}
          </button>

          <div className="ticket-counter-row">
            {getLanguageByKey("Toate tichetele")}: {tickets.length} |{" "}
            {getLanguageByKey("Filtrate")}:{" "}
            {isTableView ? totalLeads : filteredTickets.length}
          </div>

          {selectedTickets.length > 0 && (
            <Button
              variant="danger"
              onClick={deleteTicket}
              className="d-flex align-items-center gap-8"
            >
              <FaTrash /> {getLanguageByKey("Ștergere")} (
              {selectedTickets.length})
            </Button>
          )}

          {selectedTickets.length > 0 && (
            <Button
              variant="warning"
              onClick={() => editSelectedTickets()}
              className="d-flex align-items-center gap-8"
            >
              <FaEdit /> {getLanguageByKey("Editare")} ({selectedTickets.length}
              )
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() => setIsFilterOpen(true)}
            className="button-filter"
          >
            <FaFilter />
            {Object.values(filters).some((value) =>
              Array.isArray(value) ? value.length > 0 : value
            ) && <span className="filter-indicator"></span>}
          </Button>
        </div>
      </div>

      <div
        style={{
          "--leads-filter-height": `${leadsFilterHeight}px`
        }}
        className={`dashboard-container ${isTableView ? "leads-table" : ""}`}
      >
        {isTableView ? (
          <div className="leads-table">
            <LeadTable
              loading={loading}
              currentPage={currentPage}
              filteredLeads={hardTickets}
              selectedTickets={selectedTickets}
              toggleSelectTicket={toggleSelectTicket}
              totalLeads={getTotalPages(totalLeads)}
              onChangePagination={handlePaginationWorkflow}
              selectTicket={selectedTickets}
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
                  searchTerm={debouncedSearch}
                  onEditTicket={(ticket) => {
                    setCurrentTicket(ticket)
                    setIsModalOpen(true)
                  }}
                />
              ))}
          </div>
        )}

        {(isLoading || loading) && <SpinnerRightBottom />}
        {isModalOpen && currentTicket && (
          <TicketModal
            ticket={currentTicket}
            onClose={closeModal}
            onSave={(updatedTicket) => {
              setTickets((prevTickets) => {
                const isEditing = Boolean(updatedTicket.ticket_id)
                return isEditing
                  ? prevTickets.map((ticket) =>
                      ticket.id === updatedTicket.ticket_id
                        ? updatedTicket
                        : ticket
                    )
                  : [...prevTickets, updatedTicket]
              })
            }}
          />
        )}

        <TicketFilterModal
          loading={loading}
          isOpen={isFilterOpen && !isTableView}
          onClose={closeTicketModal}
          onApplyWorkflowFilters={(filters) =>
            applyWorkflowFilters(
              normalizeLadsFilters(filters),
              filteredTicketIds
            )
          }
          onApplyTicketFilters={(filters) => {
            handleApplyFilterLightTicket(normalizeLadsFilters(filters))
          }}
        />

        <TicketFilterModal
          loading={loadingFilters}
          isOpen={isFilterOpen && isTableView}
          onClose={closeTicketModal}
          onApplyWorkflowFilters={closeTicketModal}
          onApplyTicketFilters={(filters) =>
            handleApplyFiltersHardTicket(normalizeLadsFilters(filters))
          }
          resetTicketsFilters={setTableLeadsFilters}
        />
      </div>
      <Modal
        open={isChatOpen}
        onClose={closeChatModal}
        title=""
        width={1850}
        height={1000}
        footer={null}
        showCloseButton={false}
      >
        {ticketId && (
          <SingleChat ticketId={ticketId} onClose={closeChatModal} />
        )}
      </Modal>
    </>
  )
}

export default Leads
