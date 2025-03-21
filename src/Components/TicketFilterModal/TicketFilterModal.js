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

  // const clearSystemFilters = () => {
  //   const resetFilters = {
  //     ...filterDefaults,
  //     workflow: filterDefaults.workflow || []
  //   }

  //   setSystemFilters(resetFilters)
  // }

  // const content = {
  //   workflow: (
  //     <div className="container-content-title | d-flex justify-content-between flex-column gap-8">
  //       <div>
  //         <h2>{getLanguageByKey("Filtru de sistem")}</h2>

  //         <WorkflowFilter
  //           handleMultiSelectChange={handleMultiSelectChangeSystemFilters}
  //           selectedValues={systemFilters.workflow}
  //         />
  //       </div>
  //       <div className="d-flex gap-8 justify-content-end">
  //         <Button onClick={clearSystemFilters}>
  //           {getLanguageByKey("Reset filter")}
  //         </Button>
  //         <Button onClick={onClose}>{getLanguageByKey("Anuleaza")}</Button>
  //         <Button
  //           loading={loading}
  //           variant="primary"
  //           onClick={() => onApplyWorkflowFilters(systemFilters)}
  //         >
  //           {getLanguageByKey("Confirma")}
  //         </Button>
  //       </div>
  //     </div>
  //   ),

  //   ticket: (
  //     <div className="container-content-title">
  //       <div className="mb-16">
  //         <h2>{getLanguageByKey("Filtru pentru Lead")}</h2>

  //         <div className="container-ticket-content | d-flex flex-column gap-16">
  //           <div className="container-extra-group">
  //             <WorkflowFilter
  //               handleMultiSelectChange={handleMultiSelectChange}
  //               selectedValues={leadFilters.workflow}
  //             />
  //           </div>

  //           <LeadCreationDate
  //             handleInputChange={handleInputChange}
  //             filters={leadFilters}
  //             handleMultiSelectChange={handleMultiSelectChange}
  //           />

  //           <Contact
  //             filters={leadFilters}
  //             handleInputChange={handleInputChange}
  //             handleMultiSelectChange={handleMultiSelectChange}
  //             onFilters={changeFilters}
  //           />

  //           <Invoice
  //             handleMultiSelectChange={handleMultiSelectChange}
  //             handleInputChange={handleInputChange}
  //             filters={leadFilters}
  //           />

  //           <QualityControl
  //             handleInputChange={handleInputChange}
  //             handleMultiSelectChange={handleMultiSelectChange}
  //             filters={leadFilters}
  //           />
  //         </div>
  //       </div>
  //       <div className="d-flex gap-8 justify-content-end">
  //         <Button onClick={clearFilters}>
  //           {getLanguageByKey("Reset filter")}
  //         </Button>
  //         <Button onClick={onClose}>{getLanguageByKey("Anuleaza")}</Button>
  //         <Button
  //           loading={loading}
  //           variant="primary"
  //           onClick={() => onApplyTicketFilters(leadFilters)}
  //         >
  //           {getLanguageByKey("Confirma")}
  //         </Button>
  //       </div>
  //     </div>
  //   ),

  //   messages: (
  //     <div className="container-content-title">
  //       <h2>{getLanguageByKey("Filtru pentru mesaje (coming soon)")}</h2>
  //       <div className="d-flex flex-column gap-8">
  //         <label>{getLanguageByKey("Platforma mesaj")}</label>
  //         <CustomMultiSelect
  //           options={platformOptions}
  //           placeholder={getLanguageByKey("Platforma mesaj")}
  //           onChange={(values) => handleMultiSelectChange("platform", values)}
  //           selectedValues={leadFilters.platform}
  //         />
  //       </div>
  //     </div>
  //   )
  // }

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
        <>
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
        </>
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

            <Tabs.Panel value="filter_general_info">
              <GeneralInfoTicketForm
                onClose={onClose}
                onSubmit={onApplyTicketFilters}
              />
            </Tabs.Panel>
            <Tabs.Panel value="filter_ticket_info">
              <TicketInfoForm onClose={onClose} />
            </Tabs.Panel>
            <Tabs.Panel value="filter_contact">
              <ContractTicketForm
                onClose={onClose}
                onSubmit={onApplyTicketFilters}
              />
            </Tabs.Panel>

            <Tabs.Panel value="filter_invoice">
              <Invoice onClose={onClose} onSubmit={onApplyTicketFilters} />
            </Tabs.Panel>

            <Tabs.Panel value="filter_quality_control">
              <QualityControl
                onClose={onClose}
                onSubmit={onApplyTicketFilters}
              />
            </Tabs.Panel>
          </Tabs>

          {/* Invoice */}

          {/* <SelectWorkflow
            onChange={handleMultiSelectChange}
            selectedValues={leadFilters.workflow}
          /> */}

          {/* <LeadCreationDate
            handleInputChange={handleInputChange}
            filters={leadFilters}
            handleMultiSelectChange={handleMultiSelectChange}
          /> */}

          {/* <Contact
            filters={leadFilters}
            handleInputChange={handleInputChange}
            handleMultiSelectChange={handleMultiSelectChange}
            onFilters={changeFilters}
          /> */}

          {/* <Invoice
            handleMultiSelectChange={handleMultiSelectChange}
            handleInputChange={handleInputChange}
            filters={leadFilters}
          /> */}

          {/* <QualityControl
            handleInputChange={handleInputChange}
            handleMultiSelectChange={handleMultiSelectChange}
            filters={leadFilters}
          /> */}
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
