import React, { useState, useEffect } from 'react';
import { workflowOptions } from './WorkFlowOption';
import { priorityOptions } from './PriorityOption';
import Priority from './store/Component/PriorityComponent/PriorityComponent';
import Workflow from './store/Component/WorkFlowComponent/WorkflowComponent';

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
    <div className="modal-overlay">
      <div className="modal-content">
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
              onChange={(e) => {
                handleInputChange(e);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Description"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                minHeight: 'fit-content',
                overflow: 'hidden'
              }}
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
          <div className='container-select-priority-workflow'>
            <Priority ticket={editedTicket} onChange={handleInputChange} />
            <Workflow ticket={editedTicket} onChange={handleInputChange} />
          </div>
          <div className='container-button-save-delete-close'>
            {!isCreating && (
              <button onClick={() => onDelete(ticket.id)} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Delete
              </button>
            )}
            <button onClick={handleSave} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {isCreating ? 'Create' : 'Save'}
            </button>
            <button onClick={onClose} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Close
            </button>
          </div>
        </>
      </div>
    </div>
  );

}

export default TicketModal;
