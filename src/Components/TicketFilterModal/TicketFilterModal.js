import React, { useState } from "react";
import CustomMultiSelect from "../MultipleSelect/MultipleSelect";
import "./Modal.css";
import { translations } from "../utils/translations";
import { api } from "../../api";
import { Modal } from "../Modal";
import { platformOptions, filterGroups, filterDefaults } from "./utils";
import { Workflow } from "./Workflow";
import { QualityControl } from "./QualityControl";
import { Invoice } from "./Invoice";
import { Contact } from "./Contact";
import { LeadCreationDate } from "./LeadCreationDate";
import { Tab } from "../Tab"

const language = localStorage.getItem("language") || "RO";

export const TicketFilterModal = ({
  isOpen,
  onClose,
  onApplyFilter,
  filteredTicketIds,
}) => {
  const handleApplyFilter = async () => {
    const { workflow, platform, tags, ...formattedFilters } = filters;

    if (Array.isArray(tags) && tags.length > 0) {
      formattedFilters.tags = tags.join(",");
    }

    if (Array.isArray(tags) && tags.length > 0) {
      formattedFilters.tags = `{${tags.join(",")}}`;
    } else {
      delete formattedFilters.tags;
    }

    const hasValidFilters = Object.values(formattedFilters).some((value) =>
      Array.isArray(value) ? value.length > 0 : value,
    );

    if (!hasValidFilters) {
      return;
    }

    try {
      const ticketData = await api.standalone.applyFilter(formattedFilters);
      const ticketIds = ticketData.flat().map((ticket) => ticket.id);

      onApplyFilter(filters, ticketIds.length > 0 ? ticketIds : []);
      onClose();
    } catch (error) {
      console.error("❌ Ошибка при фильтрации:", error);
    }
  };

    const handleResetFilters = () => {
    const resetFilters = {
      ...filterDefaults,
      workflow: filterDefaults.workflow || [],
    };

    setFilters(resetFilters);

    onApplyFilter(resetFilters, null);
  };

  const tabs = Object.keys(filterGroups);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [filters, setFilters] = useState(filterDefaults);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]:
        name === "tags" ? value.split(",").map((tag) => tag.trim()) : value,
    }));

    const field = document.querySelector(`[name="${name}"]`);
    if (field) {
      if (value && value.length > 0) {
        field.classList.add("filled-field");
      } else {
        field.classList.remove("filled-field");
      }
    }
  };

  const changeFilters = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiSelectChange = (name, selectedValues) => {
    setFilters((prev) => ({
      ...prev,
      [name]: selectedValues,
    }));

    const field = document.querySelector(`[name="${name}"]`);
    if (field) {
      if (selectedValues.length > 0) {
        field.classList.add("filled-field");
      } else {
        field.classList.remove("filled-field");
      }
    }
  };

  const content = {
    workflow: (
      <div  className="content">
        <h2>{translations["Filtru de sistem"][language]}</h2>
        <Workflow
          onApplyFilter={() => onApplyFilter(filters, filteredTicketIds)}
          handleMultiSelectChange={handleMultiSelectChange}
          selectedValues={filters.workflow}
          onClose={onClose}
          handleResetFilters={handleResetFilters}
        />
      </div>
    ),

    ticket: (
      <div  className="content leads-filters-modal">
        <h2>{translations["Filtru pentru Lead"][language]}</h2>

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

        <div className="modal-buttons">
          <button onClick={handleApplyFilter} className="apply-btn">
            {translations["Aplica filtru"][language]}
          </button>
          <button onClick={handleResetFilters} className="reset-btn">
            {translations["Reset filtru"][language]}
          </button>
          <button onClick={onClose} className="cancel-btn">
            {translations["Close"][language]}
          </button>
        </div>
      </div>
    ),

    messages: (
      <div  className="content">
        <h2>{translations["Filtru pentru mesaje (coming soon)"][language]}</h2>
        <div className="workflow-multi-select">
          <label>{translations["Platforma mesaj"][language]}</label>
          <CustomMultiSelect
            options={platformOptions}
            placeholder={translations["Platforma mesaj"][language]}
            onChange={(values) => handleMultiSelectChange("platform", values)}
            selectedValues={filters.platform}
          />
        </div>
      </div>
    ),
  };

  const tabsButtons = [
    {
      title: "Workflow",
      key: "workflow",
    },
    {
      title: "Ticket",
      key: "ticket",
    },
    {
      title: "Messages",
      key: "messages",
    },
  ];


  return (
    <Modal
      open={isOpen}
      onClose={onClose}
       footer={null}
      width={1000}
      height={700}
    >

        <Tab headerContentSpacing={24} tabs={tabsButtons} content={content}/>


    </Modal>
  );
};
