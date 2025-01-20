import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { truncateText, parseTags } from '../utils/stringUtils';
import { getPriorityColor } from '../utils/ticketUtils';
import './TicketCardComponent.css';

const TicketCard = ({ ticket, onContextMenu, onEditTicket }) => {
    const [currentTicket, setCurrentTicket] = useState(null);
    const tags = parseTags(ticket.tags);
    const navigate = useNavigate();

    const handleDragStart = (e, clientId) => {
        e.dataTransfer.setData('clientId', clientId);
    };

    const handleTicketClick = (ticket) => {
        setCurrentTicket(ticket);
        navigate(`/chat/${ticket.client_id}`)
    };

    return (
        <div
            className="ticket"
            onContextMenu={(e) => onContextMenu(e, ticket)}
            onClick={() => handleTicketClick(ticket)}
            draggable
            onDragStart={(e) => handleDragStart(e, ticket.client_id)}
        >
            <div className="tickets-descriptions">
                <div className="ticket-ribbon" style={{ backgroundColor: getPriorityColor(ticket.priority) }}>

                </div>
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