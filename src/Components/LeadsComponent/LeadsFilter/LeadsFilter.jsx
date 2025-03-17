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

const getTicketCount = (isTable, total, filtered) => {
  return `${getLanguageByKey("Filtrate")}: ${isTable ? total : filtered}`
}

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
      //   TODO: add ref
      //   ref={}
      className="dashboard-header"
    >
      <div className="header">
        <Button
          variant="primary"
          className="add-lead"
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
          className="search-input"
          clear
        />

        <div className="ticket-counter-row">
          {getTicketCount(isTableView, totalLeads, filteredTickets.length)}
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

        <button onClick={() => setIsFilterOpen(true)} className="button-filter">
          <div className="d-flex align-items-center">
            <LuFilter />
          </div>
          {Object.values(filters).some((value) =>
            Array.isArray(value) ? value.length > 0 : value
          ) && <span className="filter-indicator"></span>}
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
          onChange={(data) => console.log(data)}
          options={[
            { value: "RO", label: "RO" },
            { value: "MD", label: "MD" },
            { value: "Filiale", label: "Fil" },
            { value: "Francize", label: "Francize" }
          ]}
        />
      </div>
    </div>
  )
}
