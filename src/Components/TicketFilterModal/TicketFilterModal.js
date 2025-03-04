import React, { useState } from "react"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import "./TicketFilterModal.css"
import { api } from "../../api"
import { Modal } from "../Modal"
import { platformOptions, filterDefaults } from "./utils"
import { WorkflowFilter } from "./WorkflowFilter"
import { QualityControl } from "./QualityControl"
import { Invoice } from "./Invoice"
import { Contact } from "./Contact"
import { LeadCreationDate } from "./LeadCreationDate"
import { Tab } from "../Tab"
import { getLanguageByKey } from "../utils/getLanguageByKey"

const tabsButtons = [
  {
    title: getLanguageByKey("General"),
    key: "workflow"
  },
  {
    title: getLanguageByKey("Bilet"),
    key: "ticket"
  },
  {
    title: getLanguageByKey("Mesaje"),
    key: "messages"
  }
]

export const TicketFilterModal = ({
  isOpen,
  onClose,
  onApplyFilter,
  filteredTicketIds
}) => {
  const handleApplyFilter = async () => {
    const { workflow, platform, tags, ...formattedFilters } = filters

    if (Array.isArray(tags) && tags.length > 0) {
      formattedFilters.tags = tags.join(",")
    }

    if (Array.isArray(tags) && tags.length > 0) {
      formattedFilters.tags = `{${tags.join(",")}}`
    } else {
      delete formattedFilters.tags
    }

    const hasValidFilters = Object.values(formattedFilters).some((value) =>
      Array.isArray(value) ? value.length > 0 : value
    )

    if (!hasValidFilters) {
      return
    }

    try {
      const ticketData = await api.standalone.applyFilter(formattedFilters)
      const ticketIds = ticketData.flat().map((ticket) => ticket.id)

      onApplyFilter(filters, ticketIds.length > 0 ? ticketIds : [])
      onClose()
    } catch (error) {
      console.error("❌ Ошибка при фильтрации:", error)
    }
  }

  const handleResetFilters = () => {
    const resetFilters = {
      ...filterDefaults,
      workflow: filterDefaults.workflow || []
    }

    setFilters(resetFilters)

    onApplyFilter(resetFilters, null)
  }

  const [filters, setFilters] = useState(filterDefaults)

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFilters((prev) => ({
      ...prev,
      [name]:
        name === "tags" ? value.split(",").map((tag) => tag.trim()) : value
    }))

    const field = document.querySelector(`[name="${name}"]`)
    if (field) {
      if (value && value.length > 0) {
        field.classList.add("filled-field")
      } else {
        field.classList.remove("filled-field")
      }
    }
  }

  const changeFilters = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMultiSelectChange = (name, selectedValues) => {
    setFilters((prev) => ({
      ...prev,
      [name]: selectedValues
    }))

    const field = document.querySelector(`[name="${name}"]`)
    if (field) {
      if (selectedValues.length > 0) {
        field.classList.add("filled-field")
      } else {
        field.classList.remove("filled-field")
      }
    }
  }

  const content = {
    workflow: (
      <div className="content">
        <h2>{getLanguageByKey("Filtru de sistem")}</h2>
        <WorkflowFilter
          onApplyFilter={() => onApplyFilter(filters, filteredTicketIds)}
          handleMultiSelectChange={handleMultiSelectChange}
          selectedValues={filters.workflow}
          onClose={onClose}
          handleResetFilters={handleResetFilters}
        />
      </div>
    ),

    ticket: (
      <div className="content leads-filters-modal">
        <h2>{getLanguageByKey("Filtru pentru Lead")}</h2>

        <div className="d-flex flex-column gap-16">
          <LeadCreationDate
            handleInputChange={handleInputChange}
            filters={filters}
            handleMultiSelectChange={handleMultiSelectChange}
          />

          <Contact
            filters={filters}
            handleInputChange={handleInputChange}
            handleMultiSelectChange={handleMultiSelectChange}
            onFilters={changeFilters}
          />

          <Invoice
            handleMultiSelectChange={handleMultiSelectChange}
            handleInputChange={handleInputChange}
            filters={filters}
          />

          <QualityControl
            handleInputChange={handleInputChange}
            handleMultiSelectChange={handleMultiSelectChange}
            filters={filters}
          />
        </div>

        <div className="modal-buttons">
          <button onClick={handleApplyFilter} className="apply-btn">
            {getLanguageByKey("Aplica filtru")}
          </button>
          <button onClick={handleResetFilters} className="reset-btn">
            {getLanguageByKey("Reset filtru")}
          </button>
          <button onClick={onClose} className="cancel-btn">
            {getLanguageByKey("Close")}
          </button>
        </div>
      </div>
    ),

    messages: (
      <div className="content">
        <h2>{getLanguageByKey("Filtru pentru mesaje (coming soon)")}</h2>
        <div className="workflow-multi-select">
          <label>{getLanguageByKey("Platforma mesaj")}</label>
          <CustomMultiSelect
            options={platformOptions}
            placeholder={getLanguageByKey("Platforma mesaj")}
            onChange={(values) => handleMultiSelectChange("platform", values)}
            selectedValues={filters.platform}
          />
        </div>
      </div>
    )
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      footer={null}
      width={1000}
      height={700}
    >
      <Tab headerContentSpacing={24} tabs={tabsButtons} content={content} />
    </Modal>
  )
}
