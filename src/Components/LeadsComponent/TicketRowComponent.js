import React from 'react';
import { workflowStyles } from '../utils/workflowStyles';
import './TicketRowComponent.css';

const TicketRow = ({ ticket, isSelected = false, onSelect = () => { }, onEditTicket }) => {
    return (
        <tr className={`ticket-row ${isSelected ? 'selected' : ''}`}>
            {/* Чекбокс теперь перед ID */}
            <td className="ticket-checkbox-row">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(ticket.id)}
                />
            </td>
            <td className="ticket-id-row">#{ticket.id}</td>
            <td className="ticket-contact-row">{ticket.contact || '—'}</td>
            <td className="ticket-name-row">{ticket.name || '—'}</td>
            <td className="ticket-surname-row">{ticket.surname || '—'}</td>
            <td className="ticket-email-row">{ticket.email || '—'}</td>
            <td className="ticket-phone-row">{ticket.phone || '—'}</td>
            <td className="ticket-description-row">{ticket.description || '—'}</td>
            <td className="ticket-tags-row">
                {Array.isArray(ticket.tags) && ticket.tags.length > 0 ? (
                    ticket.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                    ))
                ) : '—'}
            </td>
            <td className={`ticket-priority-row priority-${ticket.priority?.toLowerCase() || 'default'}`}>
                {ticket.priority || '—'}
            </td>
            <td
                className="ticket-workflow-row"
                style={workflowStyles[ticket.workflow] || { backgroundColor: '#ddd' }}
            >
                {ticket.workflow || '—'}
            </td>
        </tr>
    );
};

export default TicketRow;