import React, { useState, useMemo, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDOMElementHeight, useApp } from "../../hooks"
import { priorityOptions } from "../../FormOptions/PriorityOption"
import { workflowOptions } from "../../FormOptions/WorkFlowOption"
import WorkflowColumn from "./WorkflowColumnComponent"
import TicketModal from "./TicketModal/TicketModalComponent"
import { TicketFilterModal } from "../TicketFilterModal"
import { LeadTable } from "./LeadTable"
import { useDebounce } from "../../hooks"
import { showServerError, getTotalPages } from "../utils"
import { api } from "../../api"
import { useSnackbar } from "notistack"
import { Modal } from "../Modal"
import SingleChat from "../ChatComponent/SingleChat"
import { Spin } from "../Spin"
import { RefLeadsFilter } from "./LeadsFilter"
import "../../App.css"
import "../SnackBarComponent/SnackBarComponent.css"

const SORT_BY = "creation_date"
const ORDER = "DESC"
const HARD_TICKET = "hard"
const LIGHT_TICKET = "light"
const NUMBER_PAGE = 1

const normalizeLeadsFilters = (filters) => {
  return {
    ...filters,
    technician_id: filters.technician_id
      ? filters.technician_id.map((t) => parseInt(t.split(":")[0]))
      : []
  }
}

const filteredWorkflows = workflowOptions.filter(
  (wf) => wf !== "Realizat cu succes" && wf !== "Închis și nerealizat"
)

const Leads = () => {
  const refLeadsFilter = useRef()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const leadsFilterHeight = useDOMElementHeight(refLeadsFilter)
  const { tickets, isLoading, setTickets } = useApp()
  const { ticketId } = useParams()

  const [hardTickets, setHardTickets] = useState([])
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
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(!!ticketId)
  const [groupTitle, setGroupTitle] = useState("")
  const [selectedWorkflow, setSelectedWorkflow] = useState(filteredWorkflows)

  const [hardTicketFilters, setHardTicketFilters] = useState({})
  const [lightTicketFilters, setLightTicketFilters] = useState({})

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
          attributes: hardTicketFilters
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
    {
      page,
      type,
      sortBy = SORT_BY,
      order = ORDER,
      attributes = {},
      group_title
    },
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
        attributes,
        group_title
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
    setLightTicketFilters(updatedFilters)

    setSelectedWorkflow(
      Array.isArray(updatedFilters.workflow) ? updatedFilters.workflow : []
    )

    setFilteredTicketIds(ticketIds ?? null)
    closeTicketModal()
  }

  const handleApplyFiltersHardTicket = (formattedFilters) => {
    fetchTickets(
      { attributes: formattedFilters, page: NUMBER_PAGE, type: HARD_TICKET },
      ({ data, pagination }) => {
        setHardTickets(data)
        setTotalLeads(pagination.total || 0)
        setCurrentPage(1)
        setHardTicketFilters(formattedFilters)
        closeTicketModal()
      },
      true
    )
  }

  const handleApplyFilterLightTicket = (formattedFilters) => {
    fetchTickets(
      { page: NUMBER_PAGE, type: LIGHT_TICKET, attributes: formattedFilters },
      ({ data }) => {
        applyWorkflowFilters(formattedFilters, data)
      }
    )
  }

  const handlePaginationWorkflow = (page) => {
    fetchTickets(
      { page, type: HARD_TICKET, attributes: hardTicketFilters },
      ({ data, pagination }) => {
        setHardTickets(data)
        setTotalLeads(pagination.total || 0)
        setCurrentPage(page)
      }
    )
  }

  useEffect(() => {
    fetchTickets(
      {
        type: isTableView ? HARD_TICKET : LIGHT_TICKET,
        page: currentPage,
        attributes: {
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(isTableView ? hardTicketFilters : lightTicketFilters)
        },
        ...(groupTitle && { group_title: groupTitle })
      },
      ({ data, pagination }) => {
        if (isTableView) {
          setHardTickets(data)
          setTotalLeads(pagination.total || 0)
          return
        }
        setFilteredTicketIds(data ?? null)
        setTotalLeads(pagination || 0)
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, groupTitle, isTableView])

  return (
    <>
      <RefLeadsFilter
        ref={refLeadsFilter}
        openCreateTicketModal={openCreateTicketModal}
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
        setIsTableView={setIsTableView}
        selectedTickets={selectedTickets}
        editSelectedTickets={editSelectedTickets}
        setIsFilterOpen={setIsFilterOpen}
        deleteTicket={deleteTicket}
        hasSelectedLightListers={Object.values(lightTicketFilters).some(
          (value) => (Array.isArray(value) ? value.length > 0 : value)
        )}
        setGroupTitle={setGroupTitle}
        totalTicketsFiltered={100}
      />

      <div
        style={{
          "--leads-filter-height": `${leadsFilterHeight}px`
        }}
        className="dashboard-container"
      >
        {isLoading || loading ? (
          <div className="d-flex align-items-center justify-content-center h-full">
            <Spin />
          </div>
        ) : isTableView ? (
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
              normalizeLeadsFilters(filters),
              filteredTicketIds
            )
          }
          onApplyTicketFilters={(filters) => {
            handleApplyFilterLightTicket(normalizeLeadsFilters(filters))
          }}
        />
        <TicketFilterModal
          loading={loadingFilters}
          isOpen={isFilterOpen && isTableView}
          onClose={closeTicketModal}
          onApplyWorkflowFilters={closeTicketModal}
          onApplyTicketFilters={(filters) =>
            handleApplyFiltersHardTicket(normalizeLeadsFilters(filters))
          }
          resetTicketsFilters={setHardTicketFilters}
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
