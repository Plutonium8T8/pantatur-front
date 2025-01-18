import React from 'react';
import TicketCard from './TicketCardComponent';
import { workflowStyles } from  '../utils/workflowStyles';

const WorkflowColumn = ({ workflow, tickets, searchTerm, onEditTicket, onContextMenu }) => {
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.workflow === workflow &&
      (ticket.contact?.toLowerCase().includes(searchTerm.toLowerCase()) || !searchTerm.trim())
  );

  return (
    <div
      className="colone-ticket"
      onDragOver={(e) => e.preventDefault()}
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
