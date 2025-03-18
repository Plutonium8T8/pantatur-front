import { forwardRef } from "react"
import { FaTrash, FaEdit } from "react-icons/fa"
import { TbLayoutKanbanFilled } from "react-icons/tb"
import { IoMdAdd } from "react-icons/io"
import { LuFilter } from "react-icons/lu"
import { FaList } from "react-icons/fa6"
import { Button } from "../../Button"
import { Input } from "../../Input"
import { getLanguageByKey } from "../../utils"
import { Segmented } from "../../Segmented"
import "./LeadsFilter.css"

export const RefLeadsFilter = forwardRef(
  (
    {
      openCreateTicketModal,
      searchTerm,
      setSearchTerm,
      setIsTableView,
      selectedTickets,
      editSelectedTickets,
      setIsFilterOpen,
      deleteTicket,
      setGroupTitle,
      hasSelectedLightListers,
      totalTicketsFiltered,
      isFilterOpen
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="d-flex justify-content-between | leads-header-container"
      >
        <div className="d-flex align-items-center gap-16">
          <Button
            variant="primary"
            className="leads-header-filter-add-lead"
            onClick={openCreateTicketModal}
          >
            <div className="d-flex align-items-center gap-8">
              <IoMdAdd size={16} />
              {getLanguageByKey("Adaugă lead")}
            </div>
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
            className="leads-header-filter-search"
            clear
          />

          <div className="d-flex align-items-center | tickets-total">
            {`${getLanguageByKey("Leads")}: ${totalTicketsFiltered}`}
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

          <button
            onClick={() => setIsFilterOpen(true)}
            className={`d-flex align-items-center justify-content-center | leads-header-filter-button ${isFilterOpen ? "active" : ""}`}
          >
            <div className="d-flex align-items-center">
              <LuFilter size={16} />
            </div>
            {hasSelectedLightListers && (
              <span className="leads-header-filter-button-indicator" />
            )}
          </button>
        </div>

        <div className="d-flex gap-16">
          <Segmented
            onChange={(value) => {
              setIsTableView((prev) => value === "kanban")
            }}
            options={[
              { value: "list", label: <TbLayoutKanbanFilled /> },
              { value: "kanban", label: <FaList /> }
            ]}
          />

          <Segmented
            onChange={(group) => setGroupTitle(group)}
            options={[
              { value: "", label: getLanguageByKey("Toate") },
              { value: "RO", label: "RO" },
              { value: "MD", label: "MD" },
              { value: "Filiale", label: getLanguageByKey("Fil") },
              { value: "Francize", label: getLanguageByKey("Fra") }
            ]}
          />
        </div>
      </div>
    )
  }
)
