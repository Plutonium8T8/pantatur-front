import React from 'react';
import { Link } from 'react-router-dom';
import { truncateText, parseTags } from '../../stringUtils';
import { getPriorityColor } from '../utils/ticketUtils';
import './TicketCardComponent.css';

const TicketCard = ({ ticket }) => {
    const tags = parseTags(ticket.tags);

    // Удаляем `{}` из номера телефона
    const formattedPhone = ticket.phone && ticket.phone.trim() !== "" && ticket.phone.replace(/[{}]/g, "").trim().toLowerCase() !== "null"
        ? ticket.phone.replace(/[{}]/g, "").trim()
        : "Unknown number";

    return (
        <Link
            to={`/chat/${ticket.id}`}
            state={{ hideChatList: true }}
            className="ticket-link"
        >
            <div
                className="ticket"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('ticketId', ticket.id)}
            >
                <div className="tickets-descriptions">
                    <div className="ticket-ribbon" style={{ backgroundColor: getPriorityColor(ticket.priority) }}></div>
                    <div className="ticket-body">
                        <div className="ticket-column">
                            <div className="ticket-photo">
                                <img
                                    src={'https://storage.googleapis.com/pandatur_bucket/utils/icon-5359554_640.webp'}
                                    alt="User"
                                    className="ticket-photo-image"
                                />
                            </div>
                        </div>
                        <div className="ticket-column-2">
                            <div className="ticket-contact">
                                {ticket.contact || 'Unknown Contact'}
                            </div>
                            <div className="ticket-contact">
                                Phone: {formattedPhone}
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
        </Link>
    );
};

export default TicketCard;