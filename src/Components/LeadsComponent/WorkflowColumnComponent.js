import React from 'react';
import TicketCard from './TicketCardComponent';
import { workflowStyles, workflowBrightStyles } from '../utils/workflowStyles';

const WorkflowColumn = ({ workflow, tickets, searchTerm, onEditTicket }) => {
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
        .filter((ticket) => {
            const ticketPhone = ticket.phone ? ticket.phone.replace(/[{}]/g, "").trim() : "";

            return (
                ticket.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.id?.toString().includes(searchTerm) ||
                parseTags(ticket.tags).some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                ticketPhone.includes(searchTerm) ||
                searchTerm.trim() === ''
            );
        })
        .sort((a, b) => {
            const priorityDiff = (priorityOrder[b.priority] || 5) - (priorityOrder[a.priority] || 5);
            if (priorityDiff !== 0) return priorityDiff;

            const dateA = a.last_interaction_date ? Date.parse(a.last_interaction_date) : Number.POSITIVE_INFINITY;
            const dateB = b.last_interaction_date ? Date.parse(b.last_interaction_date) : Number.POSITIVE_INFINITY;

            if (isNaN(dateA) && isNaN(dateB)) return 0;
            if (isNaN(dateA)) return -1;
            if (isNaN(dateB)) return 1;

            return dateB - dateA;
        });

    return (
        <div
            className="colone-ticket"
            style={{
                backgroundColor: workflowStyles[workflow]?.backgroundColor || '',
            }}
        >
            <div className="name-workflow"
                style={{
                    backgroundColor: workflowBrightStyles[workflow]?.backgroundColor || '',
                }}>
                {workflow}

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
                        key={ticket.id}
                        ticket={ticket}
                        onEditTicket={onEditTicket}
                    />
                ))}
            </div>
        </div>
    );
};

export default WorkflowColumn;