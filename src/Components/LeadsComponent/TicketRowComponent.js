import React from "react";
import { Link } from "react-router-dom";
import { workflowStyles } from "../utils/workflowStyles";
import "./TicketRowComponent.css";

const cleanValue = (value) => {
  if (!value || value === "{NULL}") return "—";
  if (
    typeof value === "string" &&
    value.startsWith("{") &&
    value.endsWith("}")
  ) {
    return value.slice(1, -1);
  }
  return value;
};

const TicketRow = ({
  ticket,
  isSelected = false,
  onSelect = () => {},
  onEditTicket
}) => {
  return (
    <tr className={`ticket-row ${isSelected ? "selected" : ""}`}>
      <td className="ticket-checkbox-row">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(ticket.id)}
        />
      </td>
      <td className="ticket-id-row">
        <Link to={`/chat/${ticket.id}`} className="ticket-id-link">
          #{ticket.id}
        </Link>
      </td>
      <td className="ticket-contact-row">{cleanValue(ticket.contact)}</td>
      <td className="ticket-name-row">{cleanValue(ticket.name)}</td>
      <td className="ticket-surname-row">{cleanValue(ticket.surname)}</td>
      <td className="ticket-email-row">{cleanValue(ticket.email)}</td>
      <td className="ticket-phone-row">{cleanValue(ticket.phone)}</td>
      <td className="ticket-description-row">
        {cleanValue(ticket.description)}
      </td>
      <td className="ticket-tags-row">
        {ticket.tags &&
        typeof ticket.tags === "string" &&
        ticket.tags.startsWith("{") &&
        ticket.tags.endsWith("}")
          ? ticket.tags
              .slice(1, -1)
              .split(",")
              .map((tag, index) => (
                <span key={index} className="tag">
                  {tag.trim()}
                </span>
              ))
          : "—"}
      </td>
      <td
        className={`ticket-priority-row priority-${ticket.priority?.toLowerCase() || "default"}`}
      >
        {cleanValue(ticket.priority)}
      </td>
      <td
        className="ticket-workflow-row"
        style={workflowStyles[ticket.workflow] || { backgroundColor: "#ddd" }}
      >
        {cleanValue(ticket.workflow)}
      </td>
    </tr>
  );
};

export default TicketRow;
