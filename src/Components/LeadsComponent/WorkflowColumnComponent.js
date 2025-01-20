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

    const priorityOrder = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4,
    };
    
    const filteredTickets = tickets
        .filter((ticket) => ticket.workflow === workflow) // Filter by workflow
        .filter((ticket) =>
            ticket.contact?.toLowerCase().includes(searchTerm.toLowerCase()) || // Filter by contact
            ticket.client_id?.toString().includes(searchTerm) || // Filter by client_id
            parseTags(ticket.tags).some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) || // Filter by tags
            searchTerm.trim() === '' // Show all if searchTerm is empty
        )
        .sort((a, b) => {
            // Sort by priority first
            const priorityDiff = (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
            if (priorityDiff !== 0) return priorityDiff;
    
            // Then sort by last_interaction (earliest date first)
            const dateA = new Date(a.last_interaction);
            const dateB = new Date(b.last_interaction);
            if (!a.last_interaction) return 1; // Place undefined dates at the bottom
            if (!b.last_interaction) return -1;
            return dateA - dateB;
        });    

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