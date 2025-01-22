import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaUser, FaTrash } from 'react-icons/fa';
import './TicketModalComponent.css';
import Priority from '../../PriorityComponent/PriorityComponent';
import Workflow from '../../WorkFlowComponent/WorkflowComponent';
import TagInput from '../../TagsComponent/TagComponent';
import { useUser } from '../../../UserContext';
import Cookies from 'js-cookie';

const parseTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.filter((tag) => tag.trim() !== '');
  }
  if (typeof tags === 'string' && tags.startsWith('{') && tags.endsWith('}')) {
    return tags
      .slice(1, -1)
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
  }
  return [];
};

const TicketModal = ({ ticket, onClose, onSave }) => {
  const modalRef = useRef(null);
  const { userId } = useUser();

  const [editedTicket, setEditedTicket] = useState({
    ...ticket,
    tags: useMemo(() => parseTags(ticket?.tags), [ticket?.tags]),
  });

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTicket((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagsChange = (updatedTags) => {
    setEditedTicket((prev) => ({
      ...prev,
      tags: updatedTags,
    }));
  };

  const handleSave = async () => {
    const ticketData = {
      ...editedTicket,
      client_id: editedTicket.client_id || userId,
      technician_id: userId,
    };

    try {
      const token = Cookies.get('jwt');
      const method = editedTicket?.client_id ? 'PUT' : 'POST';
      const url = `https://pandatur-api.com/tickets/${editedTicket?.client_id || ''}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) throw new Error('Failed to save ticket');

      const result = await response.json();
      if (onSave) onSave(result);
      onClose();
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
  };

  if (!editedTicket) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>
            <FaUser /> Ticket #{ticket?.id || 'New'}
          </h2>
        </header>
        <div className="ticket-modal-form">
          <div className="input-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={editedTicket.name || ''}
              onChange={handleInputChange}
              placeholder="Client Name"
            />
          </div>
          <div className="input-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={editedTicket.description || ''}
              onChange={handleInputChange}
              placeholder="Add ticket details"
            />
          </div>
          <div className="container-select-priority-workflow">
            <Priority ticket={editedTicket} onChange={handleInputChange} />
            <Workflow ticket={editedTicket} onChange={handleInputChange} />
          </div>
          <TagInput
            initialTags={editedTicket.tags}
            onChange={handleTagsChange}
          />
          <div className="button-container">
            {ticket?.id && (
              <button
                className="clear-button"
                onClick={() => onSave(null)}
              >
                <FaTrash /> Delete
              </button>
            )}
            <button
              className="submit-button"
              onClick={handleSave}
            >
              {ticket?.id ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
