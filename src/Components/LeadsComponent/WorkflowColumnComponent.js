import React from 'react';
import TicketCard from './TicketCardComponent';
import { workflowStyles, workflowBrightStyles } from '../utils/workflowStyles';
import { translations } from "../utils/translations";
import Cookies from 'js-cookie';

const WorkflowColumn = ({ workflow, tickets, searchTerm, onEditTicket, onContextMenu, onUpdateWorkflow }) => {
    const language = localStorage.getItem('language') || 'RO';

    const parseTags = (tags) => {
        if (Array.isArray(tags)) {
            return tags;
        }
        if (typeof tags === 'string' && tags.startsWith('{') && tags.endsWith('}')) {
            const content = tags.slice(1, -1).trim();
            if (content === '') {
                return [];
            }
            return content.split(',').map(tag => tag.trim());
        }
        return [];
    };

    const priorityOrder = {
        'joasă': 1,
        'medie': 2,
        'înaltă': 3,
        'critică': 4,
    };

    const filteredTickets = tickets
        .filter((ticket) => ticket.workflow === workflow)
        .filter((ticket) =>
            ticket.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.client_id?.toString().includes(searchTerm) ||
            parseTags(ticket.tags).some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            searchTerm.trim() === ''
        ).sort((a, b) => {
            const priorityDiff = (priorityOrder[b.priority] || 5) - (priorityOrder[a.priority] || 5);
            if (priorityDiff !== 0) return priorityDiff;

            const dateA = a.last_interaction_date ? Date.parse(a.last_interaction_date) : Number.POSITIVE_INFINITY;
            const dateB = b.last_interaction_date ? Date.parse(b.last_interaction_date) : Number.POSITIVE_INFINITY;

            if (isNaN(dateA) && isNaN(dateB)) return 0;
            if (isNaN(dateA)) return -1;
            if (isNaN(dateB)) return 1;

            return dateB - dateA;
        });




    const handleDrop = async (e) => {
        e.preventDefault();
        const clientId = e.dataTransfer.getData('clientId');
        console.log('Dropped clientId:', clientId);

        if (clientId) {
            try {
                const token = Cookies.get('jwt');
                const url = `https://pandatur-api.com/tickets/${clientId}`;
                const updatedData = { workflow };

                const response = await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                    body: JSON.stringify(updatedData),
                });

                if (!response.ok) throw new Error('Failed to update workflow');

                console.log('Workflow updated for clientId:', clientId);

                // Обновляем тикеты через fetchTickets или аналогичный метод
                onUpdateWorkflow(clientId, workflow); // Локальное обновление
            } catch (error) {
                console.error('Error updating workflow:', error);
            }
        }
    };

    return (
        <div
            className="colone-ticket"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
                backgroundColor: workflowStyles[workflow]?.backgroundColor || '',
            }}
        >

            <div className="name-workflow"
                style={{
                    backgroundColor: workflowBrightStyles[workflow]?.backgroundColor || '',
                }}>
                {translations[workflow][language]}

                <div className="ticket-counter-display">
                    <div className="ticket-counter ticket-counter-red">
                        {filteredTickets.filter((ticket) => ticket.creation_date === ticket.last_interaction_date).length}
                    </div>
                    /
                    <div className="ticket-counter ticket-counter-green">
                        {filteredTickets.length}
                    </div>
                </div>

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