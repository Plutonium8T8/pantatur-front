import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPriorityColor } from '../utils/ticketUtils';
import './TicketCardComponent.css';

const TicketCard = ({ ticket, onContextMenu, onEditTicket }) => {
    const [currentTicket, setCurrentTicket] = useState(null);
    const navigate = useNavigate();

    // Обработка тегов
    const tags = useMemo(() => {
        if (typeof ticket.tags === 'string' && ticket.tags.startsWith('{') && ticket.tags.endsWith('}')) {
            return ticket.tags
                .slice(1, -1) // Убираем { и }
                .split(',') // Разделяем по запятой
                .map((tag) => tag.trim()) // Удаляем пробелы
                .filter((tag) => tag !== ''); // Убираем пустые значения
        }
        return [];
    }, [ticket.tags]);

    const handleDragStart = (e, clientId) => {
        e.dataTransfer.setData('clientId', clientId);
    };

    const handleTicketClick = (ticket) => {
        setCurrentTicket(ticket);
        navigate(`/chat/${ticket.client_id}`);
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
                            {tags.length > 0 ? (
                                tags.map((tag, index) => (
                                    <span key={index} className="tag">
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                <em></em>
                            )}
                        </div>
                    </div>
                    <div className="ticket-column">
                        <div className="ticket-date">
                            {ticket.last_interaction_date}
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