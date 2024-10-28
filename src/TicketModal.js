import React, { useState, useEffect } from 'react';
import { workflowOptions } from './WorkFlowOption';
import { priorityOptions } from './PriorityOption';
import Priority from './PriorityComponent';
import Workflow from './WorkflowComponent';

function TicketModal({ ticket, onClose, onDelete, onEdit, isCreating }) {
  const [editedTicket, setEditedTicket] = useState(ticket || {
    title: '',
    description: '',
    notes: '',
    priority: priorityOptions[0],
    workflow: workflowOptions[0],
  });

  useEffect(() => {
    if (isCreating) {
      setEditedTicket({
        title: '',
        description: '',
        notes: '',
        priority: priorityOptions[0],
        workflow: workflowOptions[0],
      });
    } else {
      setEditedTicket(ticket);
    }
  }, [ticket, isCreating]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTicket((prevTicket) => ({ ...prevTicket, [name]: value }));
    console.log("+++ ", name, value);
  };

  const handleSave = () => {
    onEdit(editedTicket);
    onClose(); 
  };

  if (!ticket && !isCreating) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '100%',
      }}>
        <>
          <label>
            Title
            <input
              type="text"
              name="title"
              value={editedTicket.title}
              onChange={handleInputChange}
              placeholder="Title"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={editedTicket.description}
              onChange={handleInputChange}
              placeholder="Description"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          <label>
            Notes
            <textarea
              name="notes"
              value={editedTicket.notes}
              onChange={handleInputChange}
              placeholder="Notes"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          <Priority ticket={editedTicket} onChange={handleInputChange} />
          <Workflow ticket={editedTicket} onChange={handleInputChange} />

          <button onClick={handleSave} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {isCreating ? 'Create' : 'Save'}
          </button>
          {!isCreating && (
            <button onClick={() => onDelete(ticket.id)} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Delete
            </button>
          )}
          <button onClick={onClose} style={{ marginTop: '1rem', marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Close
          </button>
        </>
      </div>
    </div>
  );
}

export default TicketModal;
