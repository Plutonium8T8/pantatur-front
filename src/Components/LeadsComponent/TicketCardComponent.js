import React from 'react';
import { truncateText, parseTags } from '../utils/stringUtils';

const TicketCard = ({ ticket, onContextMenu, onEditTicket }) => {
  const tags = parseTags(ticket.tags);

  return (
    <div
      className="ticket"
      onContextMenu={(e) => onContextMenu(e, ticket)}
      onClick={() => onEditTicket(ticket)}
    >
      <div className="tickets-descriptions">
        <div>{truncateText(ticket.contact, 20) || 'No contact'}</div>
        <div>Id ticket: {ticket.id || 'No ID'}</div>
        {tags.length > 0 ? (
          <div className="tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {truncateText(tag, 15)}
              </span>
            ))}
          </div>
        ) : (
          <span>No tags</span>
        )}
      </div>
    </div>
  );
};


export default TicketCard;
