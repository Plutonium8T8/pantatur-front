import React, { useState } from "react"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import "./TicketFilterModal.css"
import { Modal } from "../Modal"
import { platformOptions, filterDefaults } from "./utils"
import { WorkflowFilter } from "./WorkflowFilter"
import { QualityControl } from "./QualityControl"
import { Invoice } from "./Invoice"
import { Contact } from "./Contact"
import { LeadCreationDate } from "./LeadCreationDate"
import { Tab } from "../Tab"
import { getLanguageByKey } from "../utils/getLanguageByKey"
import { Button } from "../Button"

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

const formatFilters = (filters) => {
  const { workflow, platform, tags, ...formattedFilters } = filters

  if (Array.isArray(tags) && tags.length > 0) {
    formattedFilters.tags = `{${tags.join(",")}}`
  } else {
    delete formattedFilters.tags
  }

  const hasValidFilters = Object.values(formattedFilters).some((value) =>
    Array.isArray(value) ? value.length > 0 : value
  )

  return hasValidFilters ? formattedFilters : false
}

export const TicketFilterModal = ({
  isOpen,
  onClose,
  onApplyWorkflowFilters,
  onApplyTicketFilters,
  resetTicketsFilters,
  loading
}) => {
  const [filters, setFilters] = useState(filterDefaults)

  const filtersFormatted = formatFilters(filters)

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

  const resetFilters = () => {
    const resetFilters = {
      ...filterDefaults,
      workflow: filterDefaults.workflow || []
    }

    setFilters(resetFilters)

    resetTicketsFilters()
  }

  const content = {
    workflow: (
      <div className="container-content-title | d-flex justify-content-between flex-column gap-8">
        <div>
          <h2>{getLanguageByKey("Filtru de sistem")}</h2>
          <WorkflowFilter
            handleMultiSelectChange={handleMultiSelectChange}
            selectedValues={filters.workflow}
          />
        </div>
        <div className="d-flex gap-8 justify-content-end">
          <Button onClick={resetFilters}>
            {getLanguageByKey("Reset filter")}
          </Button>
          <Button onClick={onClose}>{getLanguageByKey("Anuleaza")}</Button>
          <Button
            loading={loading}
            variant="primary"
            onClick={() => onApplyWorkflowFilters(filters)}
          >
            {getLanguageByKey("Confirma")}
          </Button>
        </div>
      </div>
    ),

    ticket: (
      <div className="container-content-title container-ticket-content">
        <div className="mb-16">
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
        </div>
        <div className="d-flex gap-8 justify-content-end">
          <Button onClick={resetFilters}>
            {getLanguageByKey("Reset filter")}
          </Button>
          <Button onClick={onClose}>{getLanguageByKey("Anuleaza")}</Button>
          <Button
            disabled={!filtersFormatted}
            loading={loading}
            variant="primary"
            onClick={() => onApplyTicketFilters(filtersFormatted)}
          >
            {getLanguageByKey("Confirma")}
          </Button>
        </div>
      </div>
    ),

    messages: (
      <div className="container-content-title">
        <h2>{getLanguageByKey("Filtru pentru mesaje (coming soon)")}</h2>
        <div className="d-flex flex-column gap-8">
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
      loading={loading}
      footer={null}
      open={isOpen}
      width={1000}
      height={700}
      onClose={onClose}
    >
      <Tab headerContentSpacing={24} tabs={tabsButtons} content={content} />
    </Modal>
  )
}
