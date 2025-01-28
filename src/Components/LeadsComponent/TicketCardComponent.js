import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { truncateText, parseTags } from '../../stringUtils';
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
                                src={'https://storage.googleapis.com/pandatur_bucket/utils/icon-5359554_640.webp'} // Default round photo
                                alt="User"
                                className="ticket-photo-image"
                            />
                        </div>
                    </div>
                    <div className="ticket-column-2">
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
                            {ticket.creation_date}
                        </div>
                        <div
                            className="ticket-date"
                            style={{
                                color: ticket.creation_date === ticket.last_interaction_date ? 'red' : 'green',
                                textShadow: '1px 1px 2px black',
                            }}
                        >
                            {ticket.last_interaction_date}
                        </div>

                        <div className="ticket-id">
                            #{ticket.id}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;