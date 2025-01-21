import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FaUser } from 'react-icons/fa';
import './TicketModalComponent.css';
import Priority from '../../PriorityComponent/PriorityComponent';
import Workflow from '../../WorkFlowComponent/WorkflowComponent';
import TagInput from '../../TagsComponent/TagComponent';
import { useUser } from '../../../UserContext';
import { updateTicket } from '../LeadsComponent';
import Cookies from 'js-cookie';

const TicketModal = ({ ticket, onClose, onSave }) => {
  const modalRef = useRef(null);

  const deleteTicketById = async (id) => {
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`https://pandatur-api.com/tickets/${Number(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Error deleting ticket');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const saveTicketToServer = async (ticketData) => {
    try {
      const token = Cookies.get('jwt');
      console.log('Sending data:', ticketData);
      const response = await fetch('https://pandatur-api.com/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(ticketData),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
  };

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

  const parsedTags = useMemo(() => parseTags(ticket?.tags), [ticket?.tags]);

  const [editedTicket, setEditedTicket] = useState({
    ...ticket,
    tags: parsedTags,
  });

  const { userId } = useUser();

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

  const onDelete = async (clientId) => {
    try {
      const res = await deleteTicketById(clientId);
      console.log('Ticket deleted:', res);

      if (onSave) {
        onSave();
      }

      onClose();
    } catch (e) {
      console.error('Error deleting ticket:', e);
    }
  };


  const handleSave = async () => {
    const ticketData = {
      ...editedTicket,
      client_id: editedTicket.client_id || userId,
      technician_id: userId,
    };

    try {
      const res = editedTicket?.client_id == null
        ? await saveTicketToServer(ticketData)
        : await updateTicket(ticketData);

      if (!res) {
        throw new Error('Failed to save ticket');
      }

      console.log('Server response:', res);

      if (onSave) {
        onSave();
      }

      onClose();
    } catch (e) {
      console.error('Error saving ticket:', e);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onClose]);

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
          <label className="input-group">
            Name:
            <input
              type="text"
              name="name"
              value={editedTicket.name || ''}
              onChange={handleInputChange}
              placeholder="Client Name"
            />
          </label>
          <label className="input-group">
            Description:
            <textarea
              name="description"
              value={editedTicket.description || ''}
              onChange={handleInputChange}
              placeholder="Add ticket details"
            />
          </label>

          <label className="input-group">
            <div className="container-select-priority-workflow">
              <Priority ticket={editedTicket} onChange={handleInputChange} />
              <Workflow ticket={editedTicket} onChange={handleInputChange} />
            </div>
          </label>
          <div>
            <strong>Tag-uri alese:</strong>
            <div
              style={{
                padding: '10px',
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginTop: '10px',
                maxHeight: '100px',
                overflowY: 'auto',
              }}
            >
              {editedTicket.tags.length > 0 ? (
                editedTicket.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      margin: '5px',
                      fontSize: '12px',
                    }}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <em>No tags selected</em>
              )}
            </div>
          </div>
          <div className="tags-container">
            <TagInput
              initialTags={editedTicket.tags}
              onChange={handleTagsChange}
            />
          </div>
          <div className="button-container">
            <button className="submit-button" onClick={handleSave}>
              {ticket?.id ? 'Save' : 'Create'}
            </button>
            {ticket?.id && (
              <button className="clear-button" onClick={() => onSave(null)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;