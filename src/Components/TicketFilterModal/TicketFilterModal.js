import React, { useState } from "react"
import { platformOptions, filterDefaults, filteredWorkflows } from "./utils"
import { SelectWorkflow } from "./SelectWorkflow"
import { getLanguageByKey } from "../utils"
import { Tabs, Flex, Button, MultiSelect } from "@mantine/core"
import "./TicketFilterModal.css"
import {
  TicketInfoForm,
  ContractTicketForm,
  GeneralInfoTicketForm,
  Invoice,
  QualityControl
} from "../LeadsComponent/components"

const formatValue = (name, value) => {
  if (name === "tags") {
    return value.split(",").map((tag) => tag.trim())
  }

  return value
}

const systemFiltersInitialState = {
  workflow: filteredWorkflows
}

export const TicketFilterModal = ({
  onClose,
  onApplyWorkflowFilters,
  onApplyTicketFilters,
  resetTicketsFilters,
  loading
}) => {
  const [leadFilters, setLeadFilters] = useState(filterDefaults)
  const [systemFilters, setSystemFilters] = useState(systemFiltersInitialState)

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setLeadFilters((prev) => ({
      ...prev,
      [name]: formatValue(name, value)
    }))
  }

  const changeFilters = (field, value) => {
    setLeadFilters((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMultiSelectChange = (name, selectedValues) => {
    setLeadFilters((prev) => ({
      ...prev,
      [name]: formatValue(name, selectedValues)
    }))
  }

  const clearFilters = () => {
    const resetFilters = {
      ...filterDefaults,
      workflow: filterDefaults.workflow || []
    }

    setLeadFilters(resetFilters)

    resetTicketsFilters?.(resetFilters)
  }

  return (
    <Tabs defaultValue="filter_workflow">
      <Tabs.List>
        <Tabs.Tab value="filter_workflow">
          {getLanguageByKey("Filtru de sistem")}
        </Tabs.Tab>
        <Tabs.Tab value="filter_ticket">
          {getLanguageByKey("Filtru pentru Lead")}
        </Tabs.Tab>
        <Tabs.Tab value="filter_message">
          {getLanguageByKey("Filtru pentru mesaje (coming soon)")}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="filter_workflow" pt="xs">
        <Flex direction="column" justify="space-between">
          <SelectWorkflow
            selectedValues={systemFilters.workflow}
            onChange={(_, value) =>
              setSystemFilters({
                workflow: value
              })
            }
          />

          <Flex justify="end" gap="md" mt="md">
            <Button
              variant="outline"
              onClick={() => setSystemFilters(systemFiltersInitialState)}
            >
              {getLanguageByKey("Reset filter")}
            </Button>
            <Button variant="default" onClick={onClose}>
              {getLanguageByKey("Închide")}
            </Button>
            <Button
              variant="filled"
              loading={loading}
              onClick={() => onApplyWorkflowFilters(systemFilters)}
            >
              {getLanguageByKey("Trimite")}
            </Button>
          </Flex>
        </Flex>
      </Tabs.Panel>

      <Tabs.Panel value="filter_ticket" pt="xs">
        <>
          <Tabs defaultValue="filter_general_info" orientation="vertical">
            <Tabs.List>
              <Tabs.Tab value="filter_general_info">
                {getLanguageByKey("Informații generale")}
              </Tabs.Tab>
              <Tabs.Tab value="filter_ticket_info">
                {getLanguageByKey("Informații despre tichet")}
              </Tabs.Tab>
              <Tabs.Tab value="filter_contact">
                {getLanguageByKey("Contact")}
              </Tabs.Tab>
              <Tabs.Tab value="filter_invoice">
                {getLanguageByKey("Invoice")}
              </Tabs.Tab>
              <Tabs.Tab value="filter_quality_control">
                {getLanguageByKey("Control calitate")}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel pl="20" value="filter_general_info">
              <GeneralInfoTicketForm
                loading={loading}
                onClose={onClose}
                onSubmit={onApplyTicketFilters}
              />
            </Tabs.Panel>
            <Tabs.Panel pl="20" value="filter_ticket_info">
              <TicketInfoForm
                loading={loading}
                onClose={onClose}
                onSubmit={onApplyTicketFilters}
              />
            </Tabs.Panel>
            <Tabs.Panel pl="20" value="filter_contact">
              <ContractTicketForm
                loading={loading}
                onClose={onClose}
                onSubmit={onApplyTicketFilters}
              />
            </Tabs.Panel>

            <Tabs.Panel pl="20" value="filter_invoice">
              <Invoice
                loading={loading}
                onClose={onClose}
                onSubmit={onApplyTicketFilters}
              />
            </Tabs.Panel>

            <Tabs.Panel pl="20" value="filter_quality_control">
              <QualityControl
                loading={loading}
                onClose={onClose}
                onSubmit={onApplyTicketFilters}
              />
            </Tabs.Panel>
          </Tabs>
        </>
      </Tabs.Panel>

      <Tabs.Panel value="filter_message" pt="xs">
        <MultiSelect
          searchable
          clearable
          label={getLanguageByKey("Platforma mesaj")}
          placeholder={getLanguageByKey("Platforma mesaj")}
          data={platformOptions}
          defaultValue={leadFilters.platform}
        />

        <Flex justify="end" gap="md" mt="md">
          <Button variant="default" onClick={onClose}>
            {getLanguageByKey("Închide")}
          </Button>
          <Button disabled variant="filled" loading={loading} onClick={onClose}>
            {getLanguageByKey("Trimite")}
          </Button>
        </Flex>
      </Tabs.Panel>
    </Tabs>
  )
}
