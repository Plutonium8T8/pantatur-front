import React, { useEffect, useRef, useState } from 'react';
import Priority from '../../PriorityComponent/PriorityComponent';
import Workflow from '../../WorkFlowComponent/WorkflowComponent';
import TagInput from '../../TagsComponent/TagComponent';
import Cookies from 'js-cookie';
import { updateTicket } from '../LeadsComponent';
import { useUser } from '../../../UserContext';

const deleteTicketById = async (id) => {
  try {
    const token = Cookies.get('jwt');
    const response = await fetch(`https://pandatur-api.com/tickets/${id}`, {
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

const TicketModal = ({ ticket, onClose }) => {
  const modalRef = useRef(null); // Ref for modal content

  const parseTags = (tags) => {
    if (Array.isArray(tags)) {
      return tags;
    }
    if (typeof tags === 'string' && tags.startsWith('{') && tags.endsWith('}')) {
      return tags.slice(1, -1).split(',').map(tag => tag.trim());
    }
    return [];
  };

  const [editedTicket, setEditedTicket] = useState({
    ...ticket,
    tags: parseTags(ticket?.tags),
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

  const onDelete = async (ticketId) => {
    try {
      const res = await deleteTicketById(ticketId);
      console.log(res);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    const ticketData = {
      ...editedTicket,
      client_id: editedTicket.client_id || userId,
      technician_id: userId,
    };

    try {
      const res = editedTicket?.id == null
        ? await saveTicketToServer(ticketData)
        : await updateTicket(ticketData);
      console.log('Server response:', res);
      onClose();
    } catch (e) {
      console.error('Error saving ticket:', e);
    }
  };

  // Close modal when clicking outside
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
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="id-ticket">ID Ticket #{editedTicket.id}</div>
        <label>
          Nume Client
          <input
            type="text"
            name="contact"
            value={editedTicket.contact || ''}
            onChange={handleInputChange}
            placeholder="Nume Client"
            style={{
              display: 'block',
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
            }}
          />
        </label>
        <div className="container-select-priority-workflow">
          <Priority ticket={editedTicket} onChange={handleInputChange} />
          <Workflow ticket={editedTicket} onChange={handleInputChange} />
        </div>
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
        <div className="container-button-save-delete-close">
          {ticket?.id && (
            <button onClick={() => onDelete(ticket.id)} className="button-delete">
              Delete
            </button>
          )}
          <button onClick={handleSave} className="button-save">
            {!editedTicket.id ? 'Create' : 'Save'}
          </button>
          <button onClick={onClose} className="button-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
