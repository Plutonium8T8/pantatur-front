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
    title: getLanguageByKey("Lead"),
    key: "ticket"
  },
  {
    title: getLanguageByKey("Mesaje"),
    key: "messages"
  }
]

const formatValue = (name, value) => {
  if (name === "tags") {
    return value.split(",").map((tag) => tag.trim())
  }

  return value
}

export const TicketFilterModal = ({
  isOpen,
  onClose,
  onApplyWorkflowFilters,
  onApplyTicketFilters,
  resetTicketsFilters,
  loading
}) => {
  const [leadFilters, setLeadFilters] = useState(filterDefaults)
  const [systemFilters, setSystemFilters] = useState(filterDefaults)

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setLeadFilters((prev) => ({
      ...prev,
      [name]: formatValue(name, value)
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
    setLeadFilters((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMultiSelectChangeSystemFilters = (name, selectedValues) => {
    setSystemFilters((prev) => ({
      ...prev,
      [name]: formatValue(name, selectedValues)
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

  const handleMultiSelectChange = (name, selectedValues) => {
    setLeadFilters((prev) => ({
      ...prev,
      [name]: formatValue(name, selectedValues)
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

  const clearFilters = (isExternalFields) => {
    const resetFilters = {
      ...filterDefaults,
      workflow: filterDefaults.workflow || []
    }

    setLeadFilters(resetFilters)

    resetTicketsFilters?.(resetFilters)
  }

  const clearSystemFilters = (isExternalFields) => {
    const resetFilters = {
      ...filterDefaults,
      workflow: filterDefaults.workflow || []
    }

    setSystemFilters(resetFilters)
  }

  const content = {
    workflow: (
      <div className="container-content-title | d-flex justify-content-between flex-column gap-8">
        <div>
          <h2>{getLanguageByKey("Filtru de sistem")}</h2>

          <WorkflowFilter
            handleMultiSelectChange={handleMultiSelectChangeSystemFilters}
            selectedValues={systemFilters.workflow}
          />
        </div>
        <div className="d-flex gap-8 justify-content-end">
          <Button onClick={clearSystemFilters}>
            {getLanguageByKey("Reset filter")}
          </Button>
          <Button onClick={onClose}>{getLanguageByKey("Anuleaza")}</Button>
          <Button
            loading={loading}
            variant="primary"
            onClick={() => onApplyWorkflowFilters(systemFilters)}
          >
            {getLanguageByKey("Confirma")}
          </Button>
        </div>
      </div>
    ),

    ticket: (
      <div className="container-content-title">
        <div className="mb-16">
          <h2>{getLanguageByKey("Filtru pentru Lead")}</h2>

          <div className="container-ticket-content | d-flex flex-column gap-16">
            <div className="container-extra-group">
              <WorkflowFilter
                handleMultiSelectChange={handleMultiSelectChange}
                selectedValues={leadFilters.workflow}
              />
            </div>

            <LeadCreationDate
              handleInputChange={handleInputChange}
              filters={leadFilters}
              handleMultiSelectChange={handleMultiSelectChange}
            />

            <Contact
              filters={leadFilters}
              handleInputChange={handleInputChange}
              handleMultiSelectChange={handleMultiSelectChange}
              onFilters={changeFilters}
            />

            <Invoice
              handleMultiSelectChange={handleMultiSelectChange}
              handleInputChange={handleInputChange}
              filters={leadFilters}
            />

            <QualityControl
              handleInputChange={handleInputChange}
              handleMultiSelectChange={handleMultiSelectChange}
              filters={leadFilters}
            />
          </div>
        </div>
        <div className="d-flex gap-8 justify-content-end">
          <Button onClick={clearFilters}>
            {getLanguageByKey("Reset filter")}
          </Button>
          <Button onClick={onClose}>{getLanguageByKey("Anuleaza")}</Button>
          <Button
            loading={loading}
            variant="primary"
            onClick={() => onApplyTicketFilters(leadFilters)}
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
            selectedValues={leadFilters.platform}
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
