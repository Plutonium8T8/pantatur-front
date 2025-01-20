import React from 'react';
import TicketCard from './TicketCardComponent';
import { workflowStyles } from '../utils/workflowStyles';

const WorkflowColumn = ({ workflow, tickets, searchTerm, onEditTicket, onContextMenu, onUpdateWorkflow }) => {
    const parseTags = (tags) => {
        if (Array.isArray(tags)) {
            return tags; // Если это массив, возвращаем как есть
        }
        if (typeof tags === 'string' && tags.startsWith('{') && tags.endsWith('}')) {
            const content = tags.slice(1, -1).trim(); // Убираем фигурные скобки и пробелы
            if (content === '') {
                return []; // Если содержимое пустое, возвращаем пустой массив
            }
            return content.split(',').map(tag => tag.trim()); // Разделяем и обрезаем пробелы
        }
        return []; // Если формат неизвестен, возвращаем пустой массив
    };

    const filteredTickets = tickets
        .filter((ticket) => ticket.workflow === workflow) // Фильтр по workflow
        .filter((ticket) =>
            ticket.contact?.toLowerCase().includes(searchTerm.toLowerCase()) || // Фильтр по contact
            ticket.client_id?.toString().includes(searchTerm) || // Фильтр по client_id
            parseTags(ticket.tags).some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) || // Фильтр по tags
            searchTerm.trim() === '' // Если searchTerm пустой, показываем все
        );

    const handleDrop = (e) => {
        e.preventDefault();
        const clientId = e.dataTransfer.getData('clientId');
        if (clientId) {
            onUpdateWorkflow(clientId, workflow); // Update workflow using parent handler
        }
    };

    return (
        <div
            className="colone-ticket"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()} // Prevent default to allow drop
            style={{
                backgroundColor: workflowStyles[workflow]?.backgroundColor || '',
            }}
        >

            <div className="name-workflow">
                {workflow} ({filteredTickets.length})
            </div>
            <div className="scrollable-list">
                {filteredTickets.map((ticket) => (
                    <TicketCard
                        key={ticket.client_id}
                        ticket={ticket}
                        onContextMenu={onContextMenu}
                        onEditTicket={onEditTicket}
                    />
                ))}
            </div>
        </div>
    );
};

export default WorkflowColumn;