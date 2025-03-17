import { FaFilter, FaTable, FaColumns, FaTrash, FaEdit } from "react-icons/fa"
import { Button } from "../../Button"
import { Input } from "../../Input"
import { getLanguageByKey } from "../../utils"
import "./LeadsFilter.css"

export const LeadsFilter = ({
  openCreateTicketModal,
  searchTerm,
  setSearchTerm,
  setIsTableView,
  isTableView,
  tickets,
  totalLeads,
  selectedTickets,
  editSelectedTickets,
  setIsFilterOpen,
  deleteTicket,
  filters,
  filteredTickets
}) => {
  return (
    <div
      style={{ border: "1px solid red" }}
      //   TODO: add ref
      //   ref={}
      className="dashboard-header"
    >
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
            <FaTrash /> {getLanguageByKey("Ștergere")} ({selectedTickets.length}
            )
          </Button>
        )}

        {selectedTickets.length > 0 && (
          <Button
            variant="warning"
            onClick={() => editSelectedTickets()}
            className="d-flex align-items-center gap-8"
          >
            <FaEdit /> {getLanguageByKey("Editare")} ({selectedTickets.length})
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
  )
}
