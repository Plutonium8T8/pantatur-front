import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaTrash } from "react-icons/fa";
import "./TicketModalComponent.css";
import Priority from "../../PriorityComponent/PriorityComponent";
import Workflow from "../../WorkFlowComponent/WorkflowComponent";
import TagInput from "../../TagsComponent/TagComponent";
import { useUser } from "../../../UserContext";
import { translations } from "../../utils/translations";
import { useAppContext } from "../../../AppContext";
import { api } from "../../../api";
import { useSnackbar } from "notistack";

const TicketModal = ({ ticket, onClose, onSave }) => {
  const modalRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const language = localStorage.getItem("language") || "RO";

  const { setTickets } = useAppContext();
  const { userId, hasRole, isLoadingRoles } = useUser();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoadingRoles) {
      setIsAdmin(hasRole("ROLE_ADMIN"));
    }
  }, [isLoadingRoles, hasRole]);

  const parseTags = (tags) => {
    if (Array.isArray(tags)) {
      return tags;
    }
    if (
      typeof tags === "string" &&
      tags.startsWith("{") &&
      tags.endsWith("}")
    ) {
      return tags
        .slice(1, -1)
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
    }
    return [];
  };

  const [editedTicket, setEditedTicket] = useState(() => ({
    contact: "",
    description: "",
    tags: [],
    priority: "",
    workflow: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    ...ticket,
    tags: parseTags(ticket?.tags)
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTicket((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (updatedTags) => {
    setEditedTicket((prev) => ({ ...prev, tags: updatedTags }));
  };

  const handleSave = async () => {
    const ticketData = {
      ...editedTicket,
      ticket_id: editedTicket.id || userId,
      technician_id: userId,
      contact: editedTicket.contact || "",
      name: editedTicket.name,
      surname: editedTicket.surname,
      email: editedTicket.email,
      phone: editedTicket.phone
    };

    const cleanedData = Object.fromEntries(
      Object.entries(ticketData).map(([key, value]) => [key, value ?? null])
    );

    try {
      const isEditing = Boolean(editedTicket?.id);

      const updatedTicket = isEditing
        ? await api.tickets.updateById(editedTicket.id, cleanedData)
        : await api.tickets.createTickets(cleanedData);

      setTickets((prevTickets) =>
        isEditing
          ? prevTickets.map((ticket) =>
              ticket.id === updatedTicket.id ? updatedTicket : ticket
            )
          : [...prevTickets, updatedTicket]
      );

      onClose();
    } catch (e) {
      // TODO: Make a function to extract `errors` from server
      enqueueSnackbar("Ошибка при сохранении тикета", { variant: "error" });
    }
  };

  const deleteTicketById = async () => {
    try {
      await api.tickets.deleteById(editedTicket?.id);

      setTickets((prevTickets) =>
        prevTickets.filter((t) => t.id !== editedTicket.id)
      );
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const AdminRoles = isLoadingRoles ? true : !isAdmin;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>
            <FaUser /> {translations["Lead nou"][language]}
          </h2>
        </header>
        <div className="ticket-modal-form">
          <div className="container-select-priority-workflow">
            <Priority
              ticket={editedTicket}
              onChange={handleInputChange}
              disabled={AdminRoles}
            />
            <Workflow
              ticket={editedTicket}
              onChange={handleInputChange}
              disabled={AdminRoles}
            />
          </div>
          <div className="divider-line"></div>
          <div className="input-group">
            <label>{translations["name"][language]}:</label>
            <input
              type="text"
              name="name"
              value={editedTicket.name || ""}
              onChange={handleInputChange}
              placeholder={translations["name"][language]}
              required
            />
          </div>
          <div className="input-group">
            <label>{translations["surname"][language]}:</label>
            <input
              type="text"
              name="surname"
              value={editedTicket.surname || ""}
              onChange={handleInputChange}
              placeholder={translations["surname"][language]}
              required
            />
          </div>
          <div className="input-group">
            <label>{translations["email"][language]}:</label>
            <input
              type="email"
              name="email"
              value={editedTicket.email || ""}
              onChange={handleInputChange}
              placeholder={translations["email"][language]}
            />
          </div>
          <div className="input-group">
            <label>{translations["phone"][language]}:</label>
            <input
              type="tel"
              name="phone"
              value={
                editedTicket.phone && editedTicket.phone !== "{NULL}"
                  ? editedTicket.phone.replace(/[{}]/g, "")
                  : ""
              }
              onChange={handleInputChange}
              placeholder={translations["phone"][language]}
              required
            />
          </div>
          <div className="input-group">
            <label>{translations["Contact"][language]}:</label>
            <input
              type="text"
              name="contact"
              value={editedTicket.contact || ""}
              onChange={handleInputChange}
              placeholder={translations["Contact"][language]}
            />
          </div>
          <div className="divider-line"></div>
          <TagInput
            initialTags={editedTicket.tags || []}
            onChange={handleTagsChange}
          />
          <div className="input-group">
            <label>{translations["Descriere"][language]}:</label>
            <textarea
              name="description"
              value={editedTicket.description || ""}
              onChange={handleInputChange}
              placeholder={translations["Adaugă descriere lead"][language]}
              required
            />
          </div>
          <div className="button-container">
            {ticket?.id && (
              <button className="clear-button" onClick={deleteTicketById}>
                <FaTrash /> {translations["Șterge"][language]}
              </button>
            )}
            <button className="submit-button" onClick={handleSave}>
              {ticket?.id
                ? translations["Salvează"][language]
                : translations["Creează"][language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
