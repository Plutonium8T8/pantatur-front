import React from 'react';
import { truncateText, parseTags } from '../utils/stringUtils';
import './TicketCardComponent.css';

const TicketCard = ({ ticket, onContextMenu, onEditTicket }) => {
    const tags = parseTags(ticket.tags);

    const handleDragStart = (e, ticketId) => {
        e.dataTransfer.setData('ticketId', ticketId);
    };

    return (
        <div
            className="ticket"
            onContextMenu={(e) => onContextMenu(e, ticket)}
            onClick={() => onEditTicket(ticket)}
            draggable
            onDragStart={(e) => handleDragStart(e, ticket.id)}
        >
            <div className="tickets-descriptions">
                <div className="ticket-ribbon"></div>
                <div className="ticket-body">
                    <div className="ticket-column">
                        <div className="ticket-photo">
                            <img
                                src={'/user fon.png'} // Default round photo
                                alt="User"
                                className="ticket-photo-image"
                            />
                        </div>
                        <div className="ticket-id">
                            {ticket.id}
                        </div>
                    </div>
                    <div className="ticket-column">
                        <div className="ticket-contact">
                            {ticket.contact || 'Unknown Contact'}
                        </div>
                        <div className="ticket-tags">
                            {tags.map((tag, index) => (
                                <span key={index} className="tag">
                                    {truncateText(tag, 15)}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="ticket-column">
                        <div className="ticket-date">
                            16.01.2025
                        </div>
                        <div className="ticket-time">
                            13:00
                        </div>
                        <div className="ticket-tasks">
                            <p>Tasks: {ticket.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
