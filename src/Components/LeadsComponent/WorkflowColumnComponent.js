import React from 'react';
import TicketCard from './TicketCardComponent';
import { workflowStyles } from '../utils/workflowStyles';

const WorkflowColumn = ({ workflow, tickets, searchTerm, onEditTicket, onContextMenu, onUpdateWorkflow }) => {
    const filteredTickets = tickets.filter(
        (ticket) =>
            ticket.workflow === workflow &&
            (ticket.contact?.toLowerCase().includes(searchTerm.toLowerCase()) || !searchTerm.trim())
    );

    const handleDrop = (e) => {
        e.preventDefault();
        const ticketId = e.dataTransfer.getData('ticketId');
        if (ticketId) {
            onUpdateWorkflow(ticketId, workflow); // Update workflow using parent handler
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
                        key={ticket.id}
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
